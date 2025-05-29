import React, { lazy, Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@lumia/ui"; // Убедитесь, что этот импорт корректен
import { Table, Network, PenSquare, Circle } from "lucide-react";

// Lazy load components
const TwoDTable = lazy(() => import('@/components/pages/table2d')); // Убедитесь, что путь и alias '@' настроены
const TwoDGraphs = lazy(() => import('./graph2d'));
const LifeBalanceCircle = lazy(() => import('./lifebalancecircle'));
const SketchBoard = lazy(() => import('./sketchboard'));

const VisualSpace: React.FC = () => {
  const navigate = useNavigate();

  const templates = [
    { name: "2D Table", icon: Table, path: "2d-table" },
    { name: "2D Graphs", icon: Network, path: "2d-graphs" },
    { name: "Life Balance Circle", icon: Circle, path: "life-balance-circle"},
    { name: "Board", icon: PenSquare, path: "sketch-board" },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center p-8">
      <Suspense fallback={<div className="text-neutral-900 dark:text-neutral-100">Loading...</div>}>
        <Routes>
          <Route
            index
            element={
              <div className="max-w-4xl w-full">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8 text-center">
                  Choose a Visualization Template
                </h1>
                {/* Изменения здесь:
                  - Один .map для всех templates
                  - Обновлены классы grid:
                    - grid-cols-1: Одна колонка по умолчанию (на самых маленьких экранах)
                    - sm:grid-cols-2: Две колонки на экранах 'sm' и больше (для 4 элементов это будет 2x2)
                    - lg:grid-cols-2: Можно оставить sm:grid-cols-2, или если хотите чтобы на очень больших экранах кнопки не растягивались слишком сильно,
                                      можно сделать lg:grid-cols-2 и ограничить max-w-xl или max-w-2xl для самой сетки.
                                      Для 4х элементов 2х2 смотрится хорошо и на lg.
                                      Если элементов будет 5 или 6, можно будет подумать о lg:grid-cols-3.
                */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* Увеличен gap для лучшего разделения */}
                  {templates.map((template) => (
                    <motion.button
                      key={template.path}
                      onClick={() => navigate(template.path)}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg bg-white dark:bg-neutral-800",
                        "border border-neutral-200 dark:border-neutral-700",
                        "hover:bg-pastel-pink/20 hover:border-pastel-pink transition-colors focus:outline-none focus:ring-2 focus:ring-pastel-pink focus:ring-opacity-50" // Добавлены стили для фокуса
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <template.icon className="w-6 h-6 text-pastel-pink" />
                      <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                        {template.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            }
          />
          <Route path="2d-table" element={<TwoDTable />} />
          <Route path="2d-graphs" element={<TwoDGraphs />} />
          <Route path="life-balance-circle" element={<LifeBalanceCircle />} />
          <Route path="sketch-board" element={<SketchBoard />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default VisualSpace;