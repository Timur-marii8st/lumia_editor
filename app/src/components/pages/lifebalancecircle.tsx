import React, { useState } from 'react';

// Import Tauri API modules
import { save, open } from "@tauri-apps/api/dialog";
import { writeTextFile, readTextFile, createDir } from "@tauri-apps/api/fs";
import { homeDir, join } from "@tauri-apps/api/path";

// Define the Sector interface
interface Sector {
  id: string;
  name: string;
  weight: number; // Percentage value (0-100)
  color: string;
}

// Data structure for saving/loading
interface LifeBalanceData {
  sectors: Sector[];
}

// Функция для получения и создания универсального пути к директории
const ensureSaveLoadDirectory = async () => {
  const home = await homeDir();
  const saveDir = await join(home, 'Documents', 'lumia_save_data', 'save_lifebcircle');
  await createDir(saveDir, { recursive: true }); // Создаем директорию, если она не существует
  return saveDir;
};

// Helper function to determine text color based on background brightness
const getContrastingTextColor = (hexColor: string): string => {
  if (!hexColor) return '#000000';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#333333' : '#FFFFFF';
};

// Circle component to render the interactive circle
const LifeBalanceCircle: React.FC<{ sectors: Sector[] }> = ({ sectors }) => {
  const radius = 45;
  const textOffsetRadius = radius * 0.65;
  const totalWeight = sectors.reduce((sum, sector) => sum + sector.weight, 0) || 1;
  let startAngle = -90;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full max-w-[400px] max-h-[400px] mx-auto select-none">
      {sectors.map((sector) => {
        const angle = (sector.weight / totalWeight) * 360;
        const endAngle = startAngle + angle;
        const largeArcFlag = angle > 180 ? 1 : 0;
        const startX = 50 + radius * Math.cos((startAngle * Math.PI) / 180);
        const startY = 50 + radius * Math.sin((startAngle * Math.PI) / 180);
        const endX = 50 + radius * Math.cos((endAngle * Math.PI) / 180);
        const endY = 50 + radius * Math.sin((endAngle * Math.PI) / 180);
        const pathData = [
          `M 50 50`,
          `L ${startX} ${startY}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `Z`,
        ].join(' ');
        const midAngle = startAngle + angle / 2;
        const textX = 50 + textOffsetRadius * Math.cos((midAngle * Math.PI) / 180);
        const textY = 50 + textOffsetRadius * Math.sin((midAngle * Math.PI) / 180);
        const textColor = getContrastingTextColor(sector.color);
        startAngle = endAngle;
        return (
          <g key={sector.id}>
            <path
              d={pathData}
              fill={sector.color}
              stroke="#FFFFFF"
              strokeWidth="0.5"
              className="transition-all duration-300 ease-in-out hover:opacity-80"
            />
            {angle > 10 && (
              <text
                x={textX}
                y={textY}
                fill={textColor}
                fontSize="3.5"
                fontFamily="Arial, sans-serif"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
              >
                {sector.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// Control panel component for managing sectors
const SectorPanel: React.FC<{
  sectors: Sector[];
  onAddSector: () => void;
  onUpdateSector: (id: string, updates: Partial<Sector>) => void;
  onDeleteSector: (id: string) => void;
  onSave: () => void;
  onLoad: () => void;
}> = ({ sectors, onAddSector, onUpdateSector, onDeleteSector, onSave, onLoad }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-grow">
        <button
          onClick={onAddSector}
          className="w-full bg-[#F9E1E6] text-neutral-900 px-4 py-2 rounded hover:bg-[#F9E1E6]/80 transition-colors"
        >
          Add Direction
        </button>
        {sectors.map((sector) => (
          <div key={sector.id} className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm space-y-2">
            <input
              type="text"
              value={sector.name}
              onChange={(e) => onUpdateSector(sector.id, { name: e.target.value })}
              className="w-full border border-neutral-300 dark:border-neutral-600 p-2 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              placeholder="Direction name"
            />
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={sector.weight}
                onChange={(e) => {
                  let newWeight = Number(e.target.value);
                  if (newWeight < 0) newWeight = 0;
                  if (newWeight > 100) newWeight = 100;
                  onUpdateSector(sector.id, { weight: newWeight });
                }}
                min="0"
                className="w-20 border border-neutral-300 dark:border-neutral-600 p-2 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                placeholder="Weight"
              />
              <input
                type="color"
                value={sector.color}
                onChange={(e) => onUpdateSector(sector.id, { color: e.target.value })}
                className="w-10 h-10 p-0.5 border border-neutral-300 dark:border-neutral-600 rounded cursor-pointer bg-white dark:bg-neutral-700"
                title="Choose color"
              />
              <button
                onClick={() => onDeleteSector(sector.id)}
                className="ml-auto bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition-colors text-sm"
                title="Delete sector"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex space-x-3">
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            Save
          </button>
          <button
            onClick={onLoad}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            Load
          </button>
        </div>
      </div>
    </div>
  );
};

// Main page component
const LifeBalancePage: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([
    { id: 's1', name: 'Work', weight: 30, color: '#F9E1E6' },
    { id: 's2', name: 'Family', weight: 30, color: '#E6F9E1' },
    { id: 's3', name: 'Hobbies', weight: 20, color: '#E1E6F9' },
    { id: 's4', name: 'Health', weight: 20, color: '#F9F1E1' },
  ]);

  const addSector = () => {
    const newId = `sector-${Date.now()}`;
    setSectors([
      ...sectors,
      { id: newId, name: `Direction ${sectors.length + 1}`, weight: 10, color: '#D1D5DB' },
    ]);
  };

  const updateSector = (id: string, updates: Partial<Sector>) => {
    setSectors(sectors.map((sector) => (sector.id === id ? { ...sector, ...updates } : sector)));
  };

  const deleteSector = (id: string) => {
    setSectors(sectors.filter((sector) => sector.id !== id));
  };

  const handleSaveData = async () => {
    try {
      const dataToSave: LifeBalanceData = { sectors };
      const jsonData = JSON.stringify(dataToSave, null, 2);
      const saveDir = await ensureSaveLoadDirectory();
      const suggestedFilename = `lifebalance-${new Date().toISOString().split("T")[0]}.json`;
      const defaultSavePath = await join(saveDir, suggestedFilename);

      const filePath = await save({
        title: "Save Life Balance Circle",
        defaultPath: defaultSavePath,
        filters: [{ name: "Life Balance JSON", extensions: ["json"] }],
      });

      if (filePath) {
        await writeTextFile(filePath, jsonData);
        alert("Life Balance Circle data saved successfully!");
      }
    } catch (error) {
      console.error("Error saving Life Balance data:", error);
      alert(`Failed to save data: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleLoadData = async () => {
    try {
      const saveDir = await ensureSaveLoadDirectory();
      const selectedPath = await open({
        title: "Load Life Balance Circle",
        defaultPath: saveDir,
        multiple: false,
        filters: [{ name: "Life Balance JSON", extensions: ["json"] }],
      });

      if (typeof selectedPath === "string") {
        const fileContent = await readTextFile(selectedPath);
        const loadedData = JSON.parse(fileContent) as LifeBalanceData;

        if (loadedData && Array.isArray(loadedData.sectors) && loadedData.sectors.every(s => s.id && s.name && typeof s.weight === 'number' && s.color)) {
          setSectors(loadedData.sectors);
          alert("Life Balance Circle data loaded successfully!");
        } else {
          alert("Invalid file format for Life Balance data.");
        }
      }
    } catch (error) {
      console.error("Error loading Life Balance data:", error);
      alert(`Failed to load data: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      {/* Circle Area */}
      <div className="flex-1 p-4 sm:p-10 flex items-center justify-start md:w-3/4">
        <div className="w-[600px] h-[600px] -ml-60 mt-24">
          <LifeBalanceCircle sectors={sectors} />
        </div>
      </div>

      {/* Control Panel - Fixed on the right */}
      <div className="fixed right-0 top-0 w-100 h-full p-8 bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 shadow-lg overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
          Life Directions
        </h2>
        <SectorPanel
          sectors={sectors}
          onAddSector={addSector}
          onUpdateSector={updateSector}
          onDeleteSector={deleteSector}
          onSave={handleSaveData}
          onLoad={handleLoadData}
        />
      </div>
    </div>
  );
};

export default LifeBalancePage;