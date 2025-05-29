import React, { useRef, useEffect, useState, useCallback } from 'react';
import { save, open } from "@tauri-apps/api/dialog";
import { writeTextFile, readTextFile, createDir } from "@tauri-apps/api/fs";
import { homeDir, join } from "@tauri-apps/api/path";

const ensureSaveLoadDirectory = async () => {
  try {
    const home = await homeDir();
    const saveDir = await join(home, 'Documents', 'lumia_save_data', 'save_board');
    await createDir(saveDir, { recursive: true });
    return saveDir;
  } catch (error) {
    console.error("Failed to create save directory:", error);
    throw new Error(`Cannot create save directory: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const CHALKBOARD_COLOR = '#3A5335'; // Цвет классной доски (темно-зеленый)
const DEFAULT_PEN_COLOR = '#FFFFFF'; // Белый мел
const DEFAULT_LINE_WIDTH = 3;
const ERASER_LINE_WIDTH = 25; // Ластик пошире
const TEXT_FONT = '20px "Comic Sans MS", "Chalkduster", "Bradley Hand", cursive'; // Шрифты, похожие на написанные мелом

// Интерфейсы для хранения элементов рисования
interface Line {
  points: number[]; // Координаты точек [x1, y1, x2, y2, ...]
  color: string; // Цвет линии (или CHALKBOARD_COLOR для ластика)
  lineWidth: number; // Толщина линии
}

interface TextElement {
  text: string; // Текст (с поддержкой \n для многострочности)
  x: number;
  y: number;
  color: string; // Цвет текста
}

interface CanvasData {
  lines: Line[];
  texts: TextElement[];
}

const SketchboardPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'pen' | 'eraser'>('pen');
  const [currentColor, setCurrentColor] = useState(DEFAULT_PEN_COLOR);
  const [lineWidth, setLineWidth] = useState(DEFAULT_LINE_WIDTH);
  const [canvasData, setCanvasData] = useState<CanvasData>({ lines: [], texts: [] });
  const [currentLine, setCurrentLine] = useState<number[]>([]);

  // Для вставки текста
  const [isTextModeActive, setIsTextModeActive] = useState(false);
  const [textInput, setTextInput] = useState({
    show: false,
    x: 0,
    y: 0,
    value: '',
  });

  const getContext = useCallback(() => {
    return canvasRef.current?.getContext('2d');
  }, []);

  // Инициализация и перерисовка фона
  const redrawBackground = useCallback(() => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.fillStyle = CHALKBOARD_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [getContext]);

  // Перерисовка всех сохраненных элементов
  const redrawCanvas = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;

    // Очищаем холст и рисуем фон
    redrawBackground();

    // Рисуем линии
    canvasData.lines.forEach((line) => {
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 0; i < line.points.length; i += 2) {
        const x = line.points[i];
        const y = line.points[i + 1];
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.closePath();
    });

    // Рисуем текст
    ctx.font = TEXT_FONT;
    ctx.textBaseline = 'top';
    const lineHeight = parseInt(TEXT_FONT, 10) * 1.2;
    canvasData.texts.forEach((textElement) => {
      ctx.fillStyle = textElement.color;
      const lines = textElement.text.split('\n');
      lines.forEach((line, index) => {
        ctx.fillText(line, textElement.x, textElement.y + index * lineHeight);
      });
    });
  }, [canvasData, getContext, redrawBackground]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;

      const ctx = getContext();
      if (ctx) {
        ctx.scale(dpr, dpr);
        redrawCanvas(); // Перерисовываем всё при изменении размера
      }
    };

    canvas.style.width = '100%';
    canvas.style.height = '100%';
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas, getContext]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = getContext();
    if (!ctx) return;

    if (isTextModeActive) {
      if (textInput.show && textInput.value.trim()) {
        drawTextOnCanvas(textInput.value, textInput.x, textInput.y, currentColor);
      }
      setTextInput({ show: true, x: offsetX, y: offsetY, value: '' });
      setIsTextModeActive(false);
      return;
    }

    setIsDrawing(true);
    setCurrentLine([offsetX, offsetY]);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || textInput.show) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = getContext();
    if (!ctx) return;

    setCurrentLine((prev) => [...prev, offsetX, offsetY]);

    if (drawingMode === 'pen') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = lineWidth;
    } else if (drawingMode === 'eraser') {
      ctx.strokeStyle = CHALKBOARD_COLOR;
      ctx.lineWidth = ERASER_LINE_WIDTH;
    }
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = getContext();
    if (ctx) {
      ctx.closePath();
    }
    if (isDrawing && currentLine.length >= 2) {
      setCanvasData((prev) => ({
        ...prev,
        lines: [
          ...prev.lines,
          {
            points: currentLine,
            color: drawingMode === 'pen' ? currentColor : CHALKBOARD_COLOR,
            lineWidth: drawingMode === 'pen' ? lineWidth : ERASER_LINE_WIDTH,
          },
        ],
      }));
    }
    setCurrentLine([]);
    setIsDrawing(false);
  };

  const drawTextOnCanvas = (text: string, x: number, y: number, color: string) => {
    setCanvasData((prev) => ({
      ...prev,
      texts: [...prev.texts, { text, x, y, color }],
    }));
  };

  const handleTextInputConfirm = () => {
    if (textInput.value.trim()) {
      drawTextOnCanvas(textInput.value, textInput.x, textInput.y, currentColor);
    }
    setTextInput({ show: false, x: 0, y: 0, value: '' });
  };

  const handleTextInputCancel = () => {
    setTextInput({ show: false, x: 0, y: 0, value: '' });
  };

  // --- Функции сохранения и загрузки ---
  const handleSaveCanvas = async () => {
    try {
      const jsonData = JSON.stringify(canvasData, null, 2);
      const saveDir = await ensureSaveLoadDirectory();
      const suggestedFilename = `sketchboard-${new Date().toISOString().split("T")[0]}.json`;
      const defaultSavePath = await join(saveDir, suggestedFilename);

      const filePath = await save({
        title: "Сохранить доску",
        defaultPath: defaultSavePath,
        filters: [{ name: "Sketchboard JSON", extensions: ["json"] }],
      });

      if (filePath) {
        await writeTextFile(filePath, jsonData);
        alert("Доска успешно сохранена!");
      }
    } catch (error) {
      console.error("Ошибка сохранения доски:", error);
      alert(
        `Не удалось сохранить доску: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleLoadCanvas = async () => {
    try {
      const saveDir = await ensureSaveLoadDirectory();
      const selectedPath = await open({
        title: "Загрузить доску",
        defaultPath: saveDir,
        multiple: false,
        filters: [{ name: "Sketchboard JSON", extensions: ["json"] }],
      });

      if (typeof selectedPath === "string") {
        const fileContent = await readTextFile(selectedPath);
        const loadedData = JSON.parse(fileContent) as CanvasData;

        if (
          loadedData &&
          Array.isArray(loadedData.lines) &&
          Array.isArray(loadedData.texts)
        ) {
          setCanvasData(loadedData);
          redrawCanvas();
          alert("Доска успешно загружена!");
        } else {
          alert("Выбранный файл имеет неверный формат для доски.");
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки доски:", error);
      alert(
        `Не удалось загрузить доску: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  // --- Обработчики выбора инструментов и цвета ---
  const selectPenTool = () => {
    setDrawingMode('pen');
    setIsTextModeActive(false);
    setLineWidth(DEFAULT_LINE_WIDTH);
    setTextInput({ ...textInput, show: false });
  };

  const selectEraserTool = () => {
    setDrawingMode('eraser');
    setIsTextModeActive(false);
    setLineWidth(ERASER_LINE_WIDTH);
    setTextInput({ ...textInput, show: false });
  };

  const activateTextTool = () => {
    setIsTextModeActive(true);
    setDrawingMode('pen');
    setTextInput({ ...textInput, show: false });
  };

  const chalkColors = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Yellow', value: '#FFFF99' },
    { name: 'Blue', value: '#ADD8E6' },
    { name: 'Pink', value: '#FFB6C1' },
    { name: 'L.Green', value: '#90EE90' },
  ];

  return (
    <div style={{ display: 'flex', width: '82vw', height: '100vh', overflow: 'hidden', background: '#222' }}>
      <div style={{ flexGrow: 1, position: 'relative' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            cursor: isTextModeActive
              ? 'text'
              : drawingMode === 'eraser'
              ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${ERASER_LINE_WIDTH + 4}' height='${ERASER_LINE_WIDTH + 4}' viewport='0 0 100 100' style='fill:black;stroke:grey;stroke-width:1px;'><rect x='2' y='2' width='${ERASER_LINE_WIDTH}' height='${ERASER_LINE_WIDTH}' rx='3' ry='3' fill='rgba(255,255,255,0.5)'/></svg>") ${ERASER_LINE_WIDTH / 2} ${ERASER_LINE_WIDTH / 2}, auto`
              : 'crosshair',
            display: 'block',
          }}
        />
        {textInput.show && (
          <div
            style={{
              position: 'absolute',
              left: `${textInput.x / (window.devicePixelRatio || 1)}px`,
              top: `${textInput.y / (window.devicePixelRatio || 1)}px`,
              zIndex: 10,
            }}
          >
            <textarea
              value={textInput.value}
              onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextInputConfirm();
                } else if (e.key === 'Escape') {
                  handleTextInputCancel();
                }
              }}
              style={{
                background: 'rgba(80, 80, 80, 0.7)',
                color: currentColor,
                border: `1px dashed ${currentColor}`,
                fontSize: `${parseInt(TEXT_FONT, 10)}px`,
                fontFamily: TEXT_FONT.split(',')
                  .map((f) => f.trim())
                  .slice(1)
                  .join(', '),
                padding: '5px',
                minWidth: '150px',
                minHeight: '50px',
                outline: 'none',
                boxShadow: '0 0 5px rgba(0,0,0,0.5)',
                resize: 'both',
              }}
            />
            <div style={{ marginTop: '5px' }}>
              <button onClick={handleTextInputConfirm} style={{ marginRight: '5px', padding: '3px 8px' }}>
                OK
              </button>
              <button onClick={handleTextInputCancel} style={{ padding: '3px 8px' }}>
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          width: '120px',
          padding: '15px',
          backgroundColor: '#404040',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          borderLeft: '2px solid #222',
          overflowY: 'auto',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Tools</h4>
        <button
          onClick={handleSaveCanvas}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: '1px solid #777',
            width: '100%',
            padding: '10px 0',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Save
        </button>
        <button
          onClick={handleLoadCanvas}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: '1px solid #777',
            width: '100%',
            padding: '10px 0',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Load
        </button>
        <button
          onClick={selectPenTool}
          style={{
            backgroundColor: drawingMode === 'pen' && !isTextModeActive ? CHALKBOARD_COLOR : '#555',
            color: 'white',
            border: `1px solid ${drawingMode === 'pen' && !isTextModeActive ? 'white' : '#777'}`,
            width: '100%',
            padding: '10px 0',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Мел
        </button>
        <button
          onClick={selectEraserTool}
          style={{
            backgroundColor: drawingMode === 'eraser' ? CHALKBOARD_COLOR : '#555',
            color: 'white',
            border: `1px solid ${drawingMode === 'eraser' ? 'white' : '#777'}`,
            width: '100%',
            padding: '10px 0',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Ластик
        </button>
        <button
          onClick={activateTextTool}
          style={{
            backgroundColor: isTextModeActive ? CHALKBOARD_COLOR : '#555',
            color: 'white',
            border: `1px solid ${isTextModeActive ? 'white' : '#777'}`,
            width: '100%',
            padding: '10px 0',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Текст
        </button>

        <h4 style={{ marginTop: '25px', marginBottom: '10px', textAlign: 'center' }}>Цвет</h4>
        {chalkColors.map((colorObj) => (
          <div key={colorObj.value} style={{ width: '100%', textAlign: 'center' }}>
            <div
              onClick={() => {
                setCurrentColor(colorObj.value);
                if (drawingMode !== 'pen') selectPenTool();
                if (isTextModeActive) setIsTextModeActive(false);
              }}
              style={{
                width: '35px',
                height: '35px',
                backgroundColor: colorObj.value,
                borderRadius: '50%',
                cursor: 'pointer',
                border:
                  currentColor === colorObj.value && drawingMode === 'pen'
                    ? '3px solid #00FFFF'
                    : `3px solid ${CHALKBOARD_COLOR}`,
                margin: '0 auto 5px auto',
                boxShadow: '1px 1px 3px rgba(0,0,0,0.5)',
              }}
              title={colorObj.name}
            />
            <small style={{ fontSize: '0.7em' }}>{colorObj.name}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SketchboardPage;