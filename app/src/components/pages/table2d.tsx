import React, { useState } from "react";
import { cn } from "@lumia/ui";

// Импорты для Tauri API
import { save, open } from "@tauri-apps/api/dialog";
import { writeTextFile, readTextFile, createDir } from "@tauri-apps/api/fs";
import { homeDir, join } from "@tauri-apps/api/path";

// Функция для получения и создания универсального пути к директории
const ensureSaveLoadDirectory = async () => {
  try {
    const home = await homeDir();
    const saveDir = await join(home, 'Documents', 'lumia_save_data', 'save_table');
    await createDir(saveDir, { recursive: true });
    return saveDir;
  } catch (error) {
    console.error("Failed to create save directory:", error);
    throw new Error(`Cannot create save directory: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const TwoDTable: React.FC = () => {
  const initialData = [
    ["Column 1", "Column 2", "Column 3", "Column 4", "Column 5", "Column 6"],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
  ];

  const [tableData, setTableData] = useState<string[][]>(initialData);

  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const newData = tableData.map((row, rIdx) =>
      rIdx === rowIndex
        ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
        : row
    );
    setTableData(newData);
  };

  const handleSaveTable = async () => {
    try {
      const jsonData = JSON.stringify(tableData, null, 2);
      const saveDir = await ensureSaveLoadDirectory();
      const suggestedFilename = `table-${new Date().toISOString().split("T")[0]}.json`;
      const defaultSavePath = await join(saveDir, suggestedFilename);

      const filePath = await save({
        title: "Сохранить таблицу",
        defaultPath: defaultSavePath,
        filters: [{ name: "JSON Table", extensions: ["json"] }],
      });

      if (filePath) {
        await writeTextFile(filePath, jsonData);
        alert("Таблица успешно сохранена!");
      }
    } catch (error) {
      console.error("Ошибка сохранения таблицы:", error);
      alert(`Не удалось сохранить таблицу: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleLoadTable = async () => {
    try {
      const saveDir = await ensureSaveLoadDirectory();
      const selectedPath = await open({
        title: "Загрузить таблицу",
        defaultPath: saveDir,
        multiple: false,
        filters: [{ name: "JSON Table", extensions: ["json"] }],
      });

      if (typeof selectedPath === "string") {
        const fileContent = await readTextFile(selectedPath);
        const loadedData = JSON.parse(fileContent);

        if (
          Array.isArray(loadedData) &&
          loadedData.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === "string"))
        ) {
          setTableData(loadedData);
          alert("Таблица успешно загружена!");
        } else {
          alert("Выбранный файл имеет неверный формат.");
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки таблицы:", error);
      alert(`Не удалось загрузить таблицу: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center p-8 relative">
      <div className="fixed top-1 right-1 z-10 flex space-x-2">
        <button
          onClick={handleSaveTable}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Save
        </button>
        <button
          onClick={handleLoadTable}
          className="px-4 py-2 bg-green-500 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Load
        </button>
      </div>

      <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
        Your Table
      </h1>
      <div className="w-full max-w-6xl overflow-x-auto shadow-lg rounded-lg">
        <table className="w-full border-collapse">
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  rowIndex === 0
                    ? "border-b-2 border-pastel-pink bg-neutral-200 dark:bg-neutral-800"
                    : "border-b border-pastel-pink",
                  "transition-colors duration-150 ease-in-out hover:bg-neutral-200 dark:hover:bg-neutral-700/50"
                )}
              >
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      "border-r border-pastel-pink px-6 py-4 text-lg text-neutral-900 dark:text-neutral-100",
                      rowIndex === 0
                        ? "font-semibold border-t-2 border-pastel-pink"
                        : "border-t border-pastel-pink",
                      colIndex === row.length - 1 ? "border-r-0" : "",
                      "min-w-[150px] focus:outline-none focus:bg-blue-100 dark:focus:bg-blue-900/50 focus:shadow-inner"
                    )}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handleCellChange(rowIndex, colIndex, e.currentTarget.innerText)
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TwoDTable;