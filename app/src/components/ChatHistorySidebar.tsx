import React from 'react';
import { ScrollArea, Button } from '@lumia/ui'; // или откуда ваши компоненты
import { PlusCircle, Trash2 } from 'lucide-react';
import type { ChatSession } from '@/components/miachat/chat.ts'; // Предполагаем импорт

interface ChatHistorySidebarProps {
  isOpen: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectChat: (id: string) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onClose: () => void;
  widthClass: string;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  sessions,
  activeSessionId,
  onSelectChat,
  onCreateNewChat,
  onDeleteChat,
  widthClass,
}) => {
  return (
    <div
      className={`
        absolute top-0 right-0 h-full bg-white dark:bg-neutral-800
        border-l border-neutral-200 dark:border-neutral-700 shadow-lg
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${widthClass}
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        rounded-xl`}
    >
      {/* Шапка панели */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
        <h2 className="font-semibold text-lg ml-1">History</h2>
        <div className="flex items-center">
             <Button variant="ghost" size="icon" onClick={onCreateNewChat} title="New Chat" className="-ml-40">
                <PlusCircle size={20} />
             </Button>
        </div>
      </div>

      {/* Список чатов */}
      <ScrollArea className="flex-1 p-2">
        {sessions.length === 0 && (
            <div className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-4 px-2">
                No chats yet. Click '+' to start a new one!
            </div>
        )}
        {sessions.map((session) => (
          <div key={session.id} className="relative group">
             <Button
                variant={session.id === activeSessionId ? 'secondary' : 'ghost'}
                className="w-full justify-start mb-1 truncate pr-8 text-left h-auto py-2" // Добавил text-left, h-auto, py-2 для многострочных заголовков
                onClick={() => onSelectChat(session.id)}
                title={session.title}
             >
                 <span className="whitespace-normal break-words"> {/* Разрешаем перенос слов */}
                    {session.title || `Chat ${session.id.substring(5)}`}
                 </span>
             </Button>
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 transform -translate-y-1/2 h-7 w-7 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" // Увеличил немного кнопку
                onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm(`Are you sure you want to delete "${session.title}"?`)){
                       onDeleteChat(session.id);
                    }
                }}
                title="Delete Chat"
             >
                <Trash2 size={16} />
             </Button>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ChatHistorySidebar;