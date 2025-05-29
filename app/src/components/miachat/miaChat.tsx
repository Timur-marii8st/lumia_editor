import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Send, PanelRightOpen, PanelRightClose, Loader2, Edit, Check, X } from "lucide-react";
import { Input, Button, Avatar } from "@lumia/ui";
import miaAvatar from './images/mia_avatar.png';

import PageNavbar from "@/components/pageNavbar";
import Container from "@/components/container";
import ChatHistorySidebar from "@/components/ChatHistorySidebar";
import { MessageList } from "./MessageList";
import { useChatStore } from "@/store/chatStore";
import type { Message, ChatSession } from './chat';

const LM_STUDIO_URL = 'http://localhost:1234/v1/chat/completions';
const LM_STUDIO_MODEL_ID = 'gemma-3-4b-it-qat'; 

const MiaChat: React.FC = () => {
  const [input, setInput] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const initialState = location.state as { initialMessage?: string; createNewChat?: boolean } | null;

  const [isLoading, setIsLoading] = useState(false);
  const [currentAiMessage, setCurrentAiMessage] = useState<string>('');
  const accumulatedResponseRef = useRef<string>('');

  // Новое состояние для редактирования названия чата
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');

  const {
    sessions: chatSessions,
    activeChatId,
    addSession,
    updateSession,
    deleteSession,
    setActiveChat,
    addMessage
  } = useChatStore();

  const activeChat = chatSessions.find((chat) => chat.id === activeChatId);
  const messages = activeChat?.messages || [];

  // Прокрутка к низу
  useEffect(() => {
    if (scrollAreaRef.current) {
      requestAnimationFrame(() => {
        scrollAreaRef.current?.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: "smooth"
        });
      });
    }
  }, [messages, currentAiMessage]);

  // Обработка инициализации активной сессии чата
  useEffect(() => {
    const currentActiveChatExists = chatSessions.some(chat => chat.id === activeChatId);
    if (!currentActiveChatExists && chatSessions.length > 0) {
      setActiveChat(chatSessions[0].id);
    } else if (chatSessions.length === 0) {
      handleCreateNewChat();
    } else if (!activeChatId && chatSessions.length > 0) {
      setActiveChat(chatSessions[0].id);
    }
  }, [chatSessions, activeChatId, addSession, setActiveChat]);

  // Обработка начального сообщения из состояния роута
  useEffect(() => {
    if (initialState?.initialMessage && initialState?.createNewChat) {
      const newId = `chat-${Date.now()}`;
      const newChat: ChatSession = {
        id: newId,
        title: initialState.initialMessage.substring(0, 35) + (initialState.initialMessage.length > 35 ? "..." : ""),
        messages: []
      };

      addSession(newChat);
      setActiveChat(newId);

      const userMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-user-initial`,
        role: "user" as const,
        content: initialState.initialMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      addMessage(newId, userMessage);
      handleSendMessageFromInitialState(initialState.initialMessage, newId);
      window.history.replaceState({}, '');
    }
  }, [initialState, addSession, setActiveChat, addMessage]);

  // Отдельная функция для отправки сообщения из initial state
  const handleSendMessageFromInitialState = async (prompt: string, chatId: string) => {
    if (!prompt.trim() || !chatId || isLoading) return;

    setIsLoading(true);
    setCurrentAiMessage('');
    accumulatedResponseRef.current = '';

    try {
      const body = {
        model: LM_STUDIO_MODEL_ID,
        messages: [
          { role: "system", content: "You are Mia, a friendly assistant. Pretend that you are a real girl with interests and feelings." },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 4096,
        stream: true
      };

      console.log("[Frontend] Отправка начального запроса в LM Studio:", body);

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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') { break; }
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
        if (chunk.includes('[DONE]')) break;
      }

      if (chatId) {
        const aiMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-ai-initial`,
          role: "assistant",
          content: accumulatedResponseRef.current,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        addMessage(chatId, aiMessage);
      }
      setIsLoading(false);
      setCurrentAiMessage('');
      accumulatedResponseRef.current = '';
      console.log("Потоковая передача LM Studio завершена для начального сообщения. Финальное сообщение добавлено.");

    } catch (error: any) {
      console.error("Ошибка связи с LM Studio (начальное сообщение):", error);
      setIsLoading(false);
      setCurrentAiMessage('');
      accumulatedResponseRef.current = '';
      const errorMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-error-initial`,
        role: "assistant" as const,
        content: `Ошибка связи с LM Studio (начальная): ${error.message || 'Неизвестная ошибка'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addMessage(chatId, errorMessage);
    }
  };

  // Функция для отправки сообщения пользователя и инициации генерации ИИ
  const handleSendMessage = async () => {
    if (!input.trim() || !activeChatId || isLoading) return;

    const userMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-user`,
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentInput = input.trim();

    // Если чат только что создан и это первое сообщение, обновляем его заголовок
    if (activeChat && activeChat.messages.length === 0 && activeChat.title === "New Chat") {
      const newTitle = currentInput.substring(0, 35) + (currentInput.length > 35 ? "..." : "");
      updateSession(activeChatId, { title: newTitle });
    }

    addMessage(activeChatId, userMessage);
    setInput("");
    setIsLoading(true);
    setCurrentAiMessage('');
    accumulatedResponseRef.current = '';

    const apiMessages = [
      { role: "system", content: "You are Mia, a friendly assistant. Pretend that you are a real girl with interests and feelings." },
      ...(activeChat?.messages || [])
        .filter(msg => msg.role !== 'system')
        .map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: currentInput }
    ];

    console.log("[Frontend] Отправка запроса в LM Studio с телом:", apiMessages);

    try {
      const body = {
        model: LM_STUDIO_MODEL_ID,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) { 
          break; 
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') { 
              break;
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
        if (chunk.includes('[DONE]')) break;
      }

      if (activeChatId) {
        const aiMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-ai`,
          role: "assistant",
          content: accumulatedResponseRef.current,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        addMessage(activeChatId, aiMessage);
      }
      setIsLoading(false);
      setCurrentAiMessage('');
      accumulatedResponseRef.current = '';
      console.log("Потоковая передача LM Studio завершена. Финальное сообщение ИИ добавлено.");

    } catch (error: any) {
      console.error("Ошибка связи с LM Studio:", error);
      setIsLoading(false);
      setCurrentAiMessage('');
      accumulatedResponseRef.current = '';
      const errorMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-error`,
        role: "assistant" as const,
        content: `Ошибка связи с LM Studio: ${error.message || 'Неизвестная ошибка'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addMessage(activeChatId, errorMessage);
    }
  };

  // Функция для создания новой сессии чата
  const handleCreateNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newChat = { id: newId, title: "New Chat", messages: [] };
    addSession(newChat);
    setActiveChat(newId);
    setInput("");
    setIsEditingTitle(false); // Сбрасываем режим редактирования при создании нового чата
    setNewChatTitle(''); // Очищаем буфер заголовка
  };

  // Обработка начала редактирования названия
  const handleEditTitle = () => {
    if (activeChat) {
      setNewChatTitle(activeChat.title);
      setIsEditingTitle(true);
    }
  };

  // Обработка сохранения названия
  const handleSaveTitle = () => {
    if (activeChatId && newChatTitle.trim()) {
      updateSession(activeChatId, { title: newChatTitle.trim() });
      setIsEditingTitle(false);
    } else {
      // Можно добавить тут логику для отображения ошибки или сброса
      setIsEditingTitle(false); // Просто закрываем, если пустое
      setNewChatTitle('');
    }
  };

  // Обработка отмены редактирования названия
  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setNewChatTitle(''); // Сбрасываем изменения
  };

  // Обработка ввода с клавиатуры (клавиша Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim() && activeChatId) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Обработка ввода с клавиатуры для редактирования заголовка
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const historyPanelWidthClass = "w-64";

  return (
    <PageNavbar title="Mia" border={false}>
      <Container className="pt-0 relative flex flex-1 h-full overflow-hidden">
        {/* Главная область чата */}
        <div className={`flex flex-col flex-1 h-full bg-neutral-50 dark:bg-neutral-900 relative max-w-5xl mx-auto w-full`}>
          <header className="flex-shrink-0">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0 overflow-hidden">
              <div className="flex items-center space-x-2 overflow-hidden min-w-0">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <img src={miaAvatar} alt="Mia Avatar" /> {/* Добавлен alt */}
                </Avatar>
                {isEditingTitle && activeChatId ? (
                  <Input
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    className="flex-1 min-w-0 px-2 py-1 text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-neutral-100 dark:bg-neutral-700"
                    autoFocus // Автофокус на поле ввода при редактировании
                  />
                ) : (
                  <h1 className="text-lg font-semibold truncate">
                    {activeChat?.title || "Chat with Mia"}
                  </h1>
                )}
                {activeChatId && ( // Показывать кнопки редактирования только если есть активный чат
                  isEditingTitle ? (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSaveTitle}
                        className="p-1 text-green-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md"
                        title="Save"
                      >
                        <Check size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancelEdit}
                        className="p-1 text-red-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md"
                        title="Cancel"
                      >
                        <X size={18} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEditTitle}
                      className="p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md ml-2" // Стильная светло-серая кнопка
                      title="Edit chat name"
                    >
                      <Edit size={16} />
                    </Button>
                  )
                )}
              </div>
            </div>
          </header>

          <div 
            className="flex-1 overflow-y-auto px-4 pt-4 pb-24" 
            ref={scrollAreaRef}
          >
            {/* Отображение финализированных сообщений */}
            {!activeChatId ? (
              <div className="text-center text-neutral-500 dark:text-neutral-400 pt-10">
                Create a chat or choose it 
              </div>
            ) : messages.length === 0 && !isLoading && !currentAiMessage ? (
              <div className="text-center text-neutral-500 dark:text-neutral-400 pt-10">
                Type something, let's discuss it!
              </div>
            ) : (
              <MessageList messages={messages} activeChatId={activeChatId} />
            )}

            {/* Отображение стримингового сообщения */}
            {isLoading && currentAiMessage && activeChatId && (
              <div className="flex justify-start mt-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
                    <img src={miaAvatar} alt="Mia Avatar" />
                  </Avatar>
                  <div className="p-3 rounded-lg shadow-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-bl-none">
                    <p className="whitespace-pre-wrap break-words">{currentAiMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Фиксированная область ввода */}
            <div className="fixed bottom-5 -right-44 transform -translate-x-1/2 w-[60%] max-w-5xl z-10">
            <div className="flex items-center space-x-2 bg-white dark:bg-neutral-800 p-2 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
              <Input
              placeholder={isLoading ? "Mia is responsing..." : (activeChatId ? "Ask me something!" : "Choose or create chat")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !activeChatId}
              className="flex-1 h-10 bg-transparent px-4 text-base border-none focus:ring-0"
              />
              <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim() || !activeChatId}
            className="p-2 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        </div>
        {/* Кнопка переключения истории */}
        <div className="fixed top-4 right-4 z-30">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="shadow-lg rounded-full w-10 h-10 bg-white dark:bg-neutral-800"
          >
            {isHistoryOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </Button>
        </div>

        {/* Мобильный оверлей */}
        {isHistoryOpen && (
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-10 md:hidden"
            onClick={() => setIsHistoryOpen(false)}
          />
        )}

        {/* Боковая панель истории чатов */}
        <div className={`fixed top-0 right-0 h-full ${historyPanelWidthClass} z-20 transition-transform duration-300 ${isHistoryOpen ? "translate-x-0" : "translate-x-full"}`}>
          <ChatHistorySidebar
            isOpen={isHistoryOpen}
            sessions={chatSessions}
            activeSessionId={activeChatId}
            onSelectChat={(id) => setActiveChat(id)}
            onCreateNewChat={handleCreateNewChat}
            onDeleteChat={deleteSession}
            onClose={() => setIsHistoryOpen(false)}
            widthClass={historyPanelWidthClass}
          />
        </div>
      </Container>
    </PageNavbar>
  );
};

export default MiaChat;