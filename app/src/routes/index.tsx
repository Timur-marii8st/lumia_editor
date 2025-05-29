import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from "@/components/container";
import PageNavbar from "@/components/pageNavbar";
import CreateFile from "@/components/file/createFile";
import { appWindow } from '@tauri-apps/api/window';

// Список фраз для смены под полем ввода
const suggestions = [
  "Let's talk about your day!",
  "Let's plan the weekend!",
  "Let's plan a trip!",
  "Maybe we can write a couple of notes?",
  "Maybe we can start writing that little paper you've been putting off?)",
];

function App() {
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(suggestions[0]);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  // Эффект для смены подсказок
  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % suggestions.length;
      setCurrentSuggestion(suggestions[index]);
    }, 4000);

    return () => clearInterval(intervalId); // Очистка интервала при размонтировании
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Navigate to chat with the message
    navigate('/mia-chat', { 
      state: { 
        initialMessage: inputValue,
        createNewChat: true // Flag to indicate we want to start a new chat
      }
    });
  };

  return (
    <PageNavbar title="Main" border={false}>
      <Container className="pt-0">
        {/* Контейнер для центрированного заголовка */}
        <div className="flex flex-col items-center justify-center min-h-[45vh] translate-y-16">
          <h2 className="text-3xl font-bold text-gray-600 dark:text-gray-300">
            Let's note something!
          </h2>
        </div>

        {/* Контейнер для остальных элементов, размещенных ниже */}
        <div className="flex flex-col items-center justify-start pb-10">
          {/* Контейнер для поля ввода и аватара */}
          <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mb-3">
            {/* Аватар Мии */}
            <img
              src={isInputHovered ? '/images/mia_ava.png' : '/images/mia_ava.png'}
              alt="Mia Avatar"
              className="absolute bottom-[50px] left-[-0px] w-48 h-auto z-0 transition-all duration-300 ease-in-out"
            />

            {/* Поле ввода */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Share your ideas with me - and we'll write it down together!"
              className={`
                w-full px-6 py-4 pr-12 rounded-full shadow-md text-lg z-10 relative
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                border-2 border-transparent
                focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
                transition-all duration-300 ease-in-out
                ${isInputHovered ? 'shadow-lg ring-2 ring-pink-300/70 border-pink-300/70' : ''}
                pl-20
              `}
              onMouseEnter={() => setIsInputHovered(true)}
              onMouseLeave={() => setIsInputHovered(false)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
            />
          </form>

          {/* Сменяющиеся надписи под полем ввода */}
          <p className="text-sm text-gray-500 dark:text-gray-400 h-5 mb-8">
            {currentSuggestion}
          </p>

          {/* Кнопки */}
          <div className="flex space-x-4">
            <div className="bg-pink-200 hover:bg-pink-300 rounded-lg">
              <CreateFile
                trigger={
                  <button
                    type="button"
                    className="px-8 py-3 text-pink-800 shadow transition-colors duration-200"
                  >
                    Create a note
                  </button>
                }
              />
            </div>
            <button 
              onClick={() => {
                navigate('/calendar');
                appWindow.setTitle("Calendar - Lumia");
              }}
              className="px-8 py-3 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg shadow transition-colors duration-200"
            >
              Calendar
            </button>
          </div>
        </div>
      </Container>
    </PageNavbar>
  );
}

export default App;