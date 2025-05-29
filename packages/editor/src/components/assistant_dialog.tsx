import React, { useState, useRef, useEffect, useCallback } from 'react';

  const LM_STUDIO_URL = 'http://localhost:1234/v1/chat/completions';
  const LM_STUDIO_MODEL_ID = 'gemma-3-4b-it-qat';

  interface AssistantMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
  }

  interface AssistantDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    initialPrompt?: string;
    maxWidth?: string | number; // Add configurable max width
    maxHeight?: string | number; // Add configurable max height
  }

  const AssistantDialog: React.FC<AssistantDialogProps> = ({
    isOpen,
    onClose,
    title = "Mia Assist.",
    initialPrompt,
    maxWidth = '50vw', // Default max width
    maxHeight = '60vh', // Default max height
  }) => {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState<AssistantMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    const [loadingStates, setLoadingStates] = useState({
      isLoading: false,
      isSending: false,
      isProcessing: false
    });

    const setLoading = (state: Partial<typeof loadingStates>) => {
      setLoadingStates(prev => ({ ...prev, ...state }));
    };

    const [currentAiMessage, setCurrentAiMessage] = useState<string>('');
    const accumulatedResponseRef = useRef<string>('');

    // Состояния для позиции диалога и статуса перетаскивания
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const scrollToBottom = useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
      scrollToBottom();
    }, [messages, currentAiMessage]);

    // Initialize with a greeting message or process initialPrompt
    useEffect(() => {
      if (isOpen) {
        if (initialPrompt && messages.length === 0) { // Only if no messages yet and an initial prompt is provided
          const userMessage: AssistantMessage = {
            id: `msg-${Date.now()}-user-initial`,
            role: 'user',
            content: initialPrompt,
          };
          setMessages([userMessage]);
          handleSend(initialPrompt, [userMessage]);
        } else if (messages.length === 0) {
          setMessages([{
            id: `msg-${Date.now()}-assistant-greeting`,
            role: 'assistant',
            content: "Hello! How can I assist you today?"
          }]);
        }
      }
    }, [isOpen, initialPrompt]);

    // Обработка начального позиционирования
    useEffect(() => {
      if (isOpen && dialogRef.current && position === null) {
        const dialogRect = dialogRef.current.getBoundingClientRect();
        // Position towards the right side, vertically centered
        const initialX = window.innerWidth - dialogRect.width / 1; 
        const initialY = (window.innerHeight - dialogRect.height) / 2;
        setPosition({ x: Math.max(0, initialX), y: Math.max(0, initialY) }); 
      }
    }, [isOpen, position]);

    useEffect(() => {
      if (!isOpen) {
        setPosition(null);
      }
    }, [isOpen]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (dialogRef.current) {
        // Prevent dragging if the click is on the close button or other interactive elements within the header if any
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        const dialogRect = dialogRef.current.getBoundingClientRect();
        setIsDragging(true);
        setOffset({
          x: e.clientX - dialogRect.left,
          y: e.clientY - dialogRect.top,
        });
      }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!isDragging || !dialogRef.current) return;
      e.preventDefault();

      let newX = e.clientX - offset.x;
      let newY = e.clientY - offset.y;

      // Boundary checks
      const dialogWidth = dialogRef.current.offsetWidth;
      const dialogHeight = dialogRef.current.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      newX = Math.max(0, Math.min(newX, viewportWidth - dialogWidth));
      newY = Math.max(0, Math.min(newY, viewportHeight - dialogHeight));

      setPosition({ x: newX, y: newY });
    }, [isDragging, offset]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleSend = useCallback(async (messageToSend?: string, currentMessages?: AssistantMessage[]) => {
      const textToSend = (messageToSend || userInput).trim();
      if (!textToSend || loadingStates.isLoading) return;

      const userMsgObject: AssistantMessage = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content: textToSend,
      };

      const updatedMessages = currentMessages ? [...currentMessages] : [...messages, userMsgObject];
      if (!currentMessages) {
          setMessages(updatedMessages);
      }
      setUserInput('');
      setLoading({ isLoading: true, isSending: true });
      setCurrentAiMessage('');
      accumulatedResponseRef.current = '';

      // Create API messages ensuring strict user/assistant alternation
      const apiMessages = [];
      
      // Filter out greeting message if it exists and get real conversation messages
      const conversationMessages = updatedMessages.filter(msg => 
        msg.content !== "Hello! How can I assist you today?"
      );
      
      if (conversationMessages.length === 0) {
        // This is the very first real message
        apiMessages.push({
          role: 'user',
          content: `You are Mia, a friendly and concise AI assistant. Pretend that you are a real girl with interests and feelings. ${textToSend}`
        });
      } else {
        // Build alternating conversation
        let isUserTurn = true;
        
        for (let i = 0; i < conversationMessages.length; i++) {
          const msg = conversationMessages[i];
          
          if (isUserTurn && msg.role === 'user') {
            // Add system context to first user message
            if (i === 0) {
              apiMessages.push({
                role: 'user',
                content: `You are Mia, a friendly and concise AI assistant. ${msg.content}`
              });
            } else {
              apiMessages.push({
                role: 'user',
                content: msg.content
              });
            }
            isUserTurn = false;
          } else if (!isUserTurn && msg.role === 'assistant') {
            apiMessages.push({
              role: 'assistant',
              content: msg.content
            });
            isUserTurn = true;
          }
          // Skip messages that don't fit the alternating pattern
        }
        
        // If we're adding a new user message and the last message isn't a user message
        if (!currentMessages && isUserTurn) {
          apiMessages.push({
            role: 'user',
            content: textToSend
          });
        }
      }

      console.log("[AssistantDialog] Conversation messages:", conversationMessages);
      console.log("[AssistantDialog] Final API messages:", apiMessages);
      console.log("[AssistantDialog] Sending to LM Studio:", JSON.stringify(apiMessages, null, 2));

      try {
        const body = {
          model: LM_STUDIO_MODEL_ID,
          messages: apiMessages,
          temperature: 0.6,
          max_tokens: 4096,
          stream: true
        };

        const response = await window.fetch(LM_STUDIO_URL, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) { throw new Error("Failed to get response body reader for streaming."); }

        const decoder = new TextDecoder();
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data.trim() === '[DONE]') {
                // setIsDoneStreaming(true); // If you need a separate flag
                gotoProcessFinalMessage();
                return; // Exit the loop and function processing here
              }
              try {
                const json = JSON.parse(data);
                const token = json.choices?.[0]?.delta?.content;
                if (token) {
                  setCurrentAiMessage(prev => prev + token);
                  accumulatedResponseRef.current += token;
                }
              } catch (e) {
                console.error("Failed to parse SSE data:", e, "Data:", data);
              }
            }
          }
          if (chunk.includes('[DONE]')) { // Double check for DONE signal
              gotoProcessFinalMessage();
              return;
          }
        }
        gotoProcessFinalMessage(); // Process whatever was accumulated if loop finishes without [DONE]

        function gotoProcessFinalMessage() {
          if (accumulatedResponseRef.current.trim()) {
              const aiMessage: AssistantMessage = {
              id: `msg-${Date.now()}-assistant`,
              role: "assistant",
              content: accumulatedResponseRef.current.trim(),
              };
              setMessages(prev => [...prev, aiMessage]);
          }
          finalizeStream();
        }

      } catch (error: any) {
        console.error("Error with LM Studio:", error);
        const errorMessage: AssistantMessage = {
          id: `msg-${Date.now()}-error`,
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}`,
        };
        setMessages(prev => [...prev, errorMessage]);
        finalizeStream();
      }
    }, [messages, loadingStates.isLoading, userInput]);

    const finalizeStream = () => {
      setLoading({ isLoading: false, isSending: false });
      setCurrentAiMessage('');
      accumulatedResponseRef.current = '';
      // setIsDoneStreaming(false); // Reset if you use this flag
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    useEffect(() => {
      return () => {
        // Cleanup function
        setMessages([]);
        setUserInput('');
        setCurrentAiMessage('');
        accumulatedResponseRef.current = '';
      };
    }, []);

    if (!isOpen) return null;

    return (
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="bg-white rounded-3xl shadow-2xl flex flex-col resize-none overflow-hidden dark:bg-neutral-800 dark:border-neutral-700"
        style={{
          position: 'fixed',
          left: position ? `${position.x}px` : 'calc(100vw - 30rem - 50px)',
          top: position ? `${position.y}px` : '50%',
          transform: position ? 'none' : 'translateY(-50%)',
          minWidth: '25rem',
          minHeight: '20rem',
          maxWidth: maxWidth, // Use configurable max width
          maxHeight: maxHeight, // Use configurable max height
          border: '1px solid #FBCFE8',
          zIndex: 1050,
          colorScheme: 'light',
          borderRadius: '24px',
        }}
      >
        <div
          className="bg-gradient-to-r from-pink-50 to-rose-50 px-5 py-3 border-b border-pink-100 flex items-center justify-between dark:from-neutral-700 dark:to-neutral-600 dark:border-neutral-600"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full flex items-center justify-center dark:from-pink-500 dark:to-rose-500">
              {/* Optional: icon or empty for a cleaner look */}
            </div>
            <h3 id="dialog-title" className="font-medium text-gray-700 dark:text-neutral-200">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-pink-100 hover:bg-pink-200 flex items-center justify-center transition-colors duration-200 text-pink-600 hover:text-pink-700 dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-neutral-300"
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent dark:scrollbar-thumb-neutral-600">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${ // Adjusted max-width
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-pink-200 to-rose-200 text-pink-800 rounded-br-none dark:from-pink-600 dark:to-rose-600 dark:text-white'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 rounded-bl-none dark:bg-neutral-700 dark:text-neutral-100 dark:border-neutral-600'
                }`}
              >
                {/* Basic markdown-like rendering for newlines */}
                {msg.content.split('\n').map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {loadingStates.isLoading && currentAiMessage && (
            <div className="flex justify-start">
              <div className="max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm bg-gray-100 text-gray-700 border border-gray-200 rounded-bl-none dark:bg-neutral-700 dark:text-neutral-100 dark:border-neutral-600">
                {/* Basic markdown-like rendering for newlines */}
                {currentAiMessage.split('\n').map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-pink-100 bg-gradient-to-r from-pink-25 to-rose-25 dark:border-neutral-700 dark:from-neutral-750 dark:to-neutral-700">
          <div className="flex gap-2 items-end">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress} 
              placeholder={loadingStates.isLoading ? "Mia is thinking..." : "Type your message..."}
              className="flex-1 resize-none rounded-xl border border-pink-100 px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white placeholder-gray-400 dark:bg-neutral-600 dark:border-neutral-500 dark:text-neutral-100 dark:placeholder-neutral-400 dark:focus:ring-pink-500"
              rows={1}
              disabled={loadingStates.isLoading}
              style={{ maxHeight: '100px', overflowY: 'auto' }} 
            />
            <button
              onClick={() => handleSend()}
              disabled={!userInput.trim() || loadingStates.isLoading}
              className="px-4 py-2.5 
                        bg-gray-800 text-black 
                        dark:bg-gray-200 dark:text-white
                        rounded-xl 
                        hover:bg-gray-900 dark:hover:bg-white
                        disabled:opacity-60 disabled:cursor-not-allowed 
                        transition-all duration-200 
                        text-sm font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default React.memo(AssistantDialog, (prevProps, nextProps) => {
    return prevProps.isOpen === nextProps.isOpen &&
           prevProps.title === nextProps.title &&
           prevProps.initialPrompt === nextProps.initialPrompt;
  });