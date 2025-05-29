import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Stage, Layer, Rect, Circle, Line, Text, Group } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";

// Импорты для Tauri API
import { save, open } from "@tauri-apps/api/dialog";
import { writeTextFile, readTextFile, createDir } from "@tauri-apps/api/fs";
import { homeDir, join } from "@tauri-apps/api/path";

interface Node {
  id: string;
  x: number;
  y: number;
  shape: "square" | "circle";
  color: string;
  borderWidth: number;
  borderColor: string;
  text: string;
  fontSize: number;
}

interface Edge {
  from: string;
  to: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

// Функция для получения и создания универсального пути к директории
const ensureSaveLoadDirectory = async () => {
  try {
    const home = await homeDir();
    const saveDir = await join(home, 'Documents', 'lumia_save_data', 'save_2dgraph');
    await createDir(saveDir, { recursive: true });
    return saveDir;
  } catch (error) {
    console.error("Failed to create save directory:", error);
    throw new Error(`Cannot create save directory: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const TwoDGraphs: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "1",
      x: 300,
      y: 300,
      shape: "square",
      color: "#FFFFFF",
      borderWidth: 2,
      borderColor: "#F9E1E6",
      text: "Idea 1",
      fontSize: 16,
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isLinkPanelOpen, setIsLinkPanelOpen] = useState(false);
  const [linkingFromNodeId, setLinkingFromNodeId] = useState<string | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 990, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (stageContainerRef.current) {
        setStageDimensions({
          width: stageContainerRef.current.offsetWidth,
          height: stageContainerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.05;
    const oldScale = stage.scaleX();

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const finalScale = Math.min(Math.max(0.2, newScale), 5);

    setScale(finalScale);
  };

  const handleDrag = (id: string, e: KonvaEventObject<DragEvent>) => {
    const newNodes = nodes.map((node) =>
      node.id === id ? { ...node, x: e.target.x(), y: e.target.y() } : node
    );
    setNodes(newNodes);
  };

  const addNode = (parentId: string) => {
    const parent = nodes.find((node) => node.id === parentId);
    if (!parent) return;
    const newNodeId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      x: parent.x + 100,
      y: parent.y + 100,
      shape: "square",
      color: "#FFFFFF",
      borderWidth: 2,
      borderColor: "#F9E1E6",
      text: `Idea ${nodes.length + 1}`,
      fontSize: 16,
    };
    setNodes([...nodes, newNode]);
    setEdges([...edges, { from: parentId, to: newNode.id }]);
  };

  const toggleShape = () => {
    if (!selectedNodeId) return;
    setNodes(
      nodes.map((node) =>
        node.id === selectedNodeId
          ? { ...node, shape: node.shape === "square" ? "circle" : "square" }
          : node
      )
    );
  };

  const updateNode = (updates: Partial<Node>) => {
    if (!selectedNodeId) return;
    setNodes(
      nodes.map((node) =>
        node.id === selectedNodeId ? { ...node, ...updates } : node
      )
    );
  };

  const handleNodeClick = (id: string) => {
    if (linkingFromNodeId) {
      if (linkingFromNodeId !== id) {
        const exists = edges.find(
          (edge) =>
            (edge.from === linkingFromNodeId && edge.to === id) ||
            (edge.from === id && edge.to === linkingFromNodeId)
        );
        if (exists) {
          setEdges(
            edges.filter(
              (edge) =>
                !(
                  (edge.from === linkingFromNodeId && edge.to === id) ||
                  (edge.from === id && edge.to === linkingFromNodeId)
                )
            )
          );
        } else {
          setEdges([...edges, { from: linkingFromNodeId, to: id }]);
        }
      }
      setLinkingFromNodeId(null);
      setIsLinkPanelOpen(false);
    } else {
      setSelectedNodeId(id);
    }
  };

  const handleSaveGraph = async () => {
    try {
      const graphDataToSave: GraphData = { nodes, edges };
      const jsonData = JSON.stringify(graphDataToSave, null, 2);
      const saveDir = await ensureSaveLoadDirectory();
      const suggestedFilename = `2dgraph-${new Date().toISOString().split("T")[0]}.json`;
      const defaultSavePath = await join(saveDir, suggestedFilename);

      const filePath = await save({
        title: "Сохранить 2D Граф",
        defaultPath: defaultSavePath,
        filters: [{ name: "2D Graph JSON", extensions: ["json"] }],
      });

      if (filePath) {
        await writeTextFile(filePath, jsonData);
        alert("2D Граф успешно сохранен!");
      }
    } catch (error) {
      console.error("Ошибка сохранения 2D графа:", error);
      alert(
        `Не удалось сохранить 2D граф: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleLoadGraph = async () => {
    try {
      const saveDir = await ensureSaveLoadDirectory();
      const selectedPath = await open({
        title: "Загрузить 2D Граф",
        defaultPath: saveDir,
        multiple: false,
        filters: [{ name: "2D Graph JSON", extensions: ["json"] }],
      });

      if (typeof selectedPath === "string") {
        const fileContent = await readTextFile(selectedPath);
        const loadedData = JSON.parse(fileContent) as GraphData;

        if (loadedData && Array.isArray(loadedData.nodes) && Array.isArray(loadedData.edges)) {
          setNodes(loadedData.nodes);
          setEdges(loadedData.edges);
          alert("2D Граф успешно загружен!");
        } else {
          alert("Выбранный файл имеет неверный формат для 2D графа.");
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки 2D графа:", error);
      alert(
        `Не удалось загрузить 2D граф: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const openLinkPanel = () => {
    setIsLinkPanelOpen(true);
    setLinkingFromNodeId(selectedNodeId);
  };

  const closeLinkPanel = () => {
    setIsLinkPanelOpen(false);
    setLinkingFromNodeId(null);
  };

  const selectNodeForLink = (id: string) => {
    if (linkingFromNodeId && linkingFromNodeId !== id) {
      const exists = edges.find(
        (edge) =>
          (edge.from === linkingFromNodeId && edge.to === id) ||
          (edge.from === id && edge.to === linkingFromNodeId)
      );
      if (exists) {
        setEdges(
          edges.filter(
            (edge) =>
              !(
                (edge.from === linkingFromNodeId && edge.to === id) ||
                (edge.from === id && edge.to === linkingFromNodeId)
              )
          )
        );
      } else {
        setEdges([...edges, { from: linkingFromNodeId, to: id }]);
      }
    }
    closeLinkPanel();
  };

  const isLinked = (nodeId: string) => {
    if (!selectedNodeId) return false;
    return edges.some(
      (edge) =>
        (edge.from === selectedNodeId && edge.to === nodeId) ||
        (edge.from === nodeId && edge.to === selectedNodeId)
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center p-8 relative">
      <div className="fixed top-1 right-1 z-10 flex space-x-2">
        <button
          onClick={handleSaveGraph}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Save
        </button>
        <button
          onClick={handleLoadGraph}
          className="px-4 py-2 bg-green-500 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Load
        </button>
      </div>

      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        2D Graphs
      </h1>

      <div
        ref={stageContainerRef}
        className="w-full max-w-5xl h-[600px] border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden shadow-lg"
      >
        <Stage
          width={stageDimensions.width}
          height={stageDimensions.height}
          scaleX={scale}
          scaleY={scale}
          onWheel={handleWheel}
          ref={stageRef}
          className="bg-neutral-50 dark:bg-neutral-800"
          draggable
        >
          <Layer>
            {edges.map((edge, i) => {
              const fromNode = nodes.find((node) => node.id === edge.from);
              const toNode = nodes.find((node) => node.id === edge.to);
              if (!fromNode || !toNode) return null;
              return (
                <Line
                  key={`edge-${edge.from}-${edge.to}-${i}`}
                  points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
                  stroke={selectedNodeId === fromNode.id || selectedNodeId === toNode.id ? "#FFB6C1" : "#F9E1E6"}
                  strokeWidth={2}
                  tension={0.5}
                />
              );
            })}
            {nodes.map((node) => (
              <Group
                key={node.id}
                x={node.x}
                y={node.y}
                draggable
                onDragEnd={(e) => handleDrag(node.id, e)}
                onClick={() => handleNodeClick(node.id)}
                onTap={() => handleNodeClick(node.id)}
                onMouseEnter={(e) => {
                  setHoveredNodeId(node.id);
                  const stage = e.target.getStage();
                  if (stage) stage.container().style.cursor = "pointer";
                }}
                onMouseLeave={(e) => {
                  setHoveredNodeId(null);
                  const stage = e.target.getStage();
                  if (stage) stage.container().style.cursor = "default";
                }}
              >
                {node.shape === "square" ? (
                  <Rect
                    width={80}
                    height={80}
                    fill={isLinked(node.id) ? "#FFFFFF" : node.color}
                    stroke={node.id === selectedNodeId ? "#FF69B4" : node.borderColor}
                    strokeWidth={node.id === selectedNodeId ? node.borderWidth + 2 : node.borderWidth}
                    shadowColor={node.id === selectedNodeId || hoveredNodeId === node.id ? "#F9A8D4" : "transparent"}
                    shadowBlur={node.id === selectedNodeId || hoveredNodeId === node.id ? 10 : 0}
                    cornerRadius={5}
                    offsetX={40}
                    offsetY={40}
                  />
                ) : (
                  <Circle
                    radius={40}
                    fill={isLinked(node.id) ? "#FFFFFF" : node.color}
                    stroke={node.id === selectedNodeId ? "#FF69B4" : node.borderColor}
                    strokeWidth={node.id === selectedNodeId ? node.borderWidth + 2 : node.borderWidth}
                    shadowColor={node.id === selectedNodeId || hoveredNodeId === node.id ? "#F9A8D4" : "transparent"}
                    shadowBlur={node.id === selectedNodeId || hoveredNodeId === node.id ? 10 : 0}
                  />
                )}
                <Text
                  text={node.text}
                  fontSize={node.fontSize}
                  fill={node.color === "#FFFFFF" || node.color === "#FFF" ? "#333333" : "#FFFFFF"}
                  align="center"
                  verticalAlign="middle"
                  width={80}
                  height={80}
                  offsetX={40}
                  offsetY={40}
                  listening={false}
                />
                <Group
                  visible={hoveredNodeId === node.id}
                  offsetX={node.shape === "square" ? -45 : -40}
                  offsetY={node.shape === "square" ? -45 : -40}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    addNode(node.id);
                  }}
                >
                  <Circle radius={12} fill="#FFB6C1" stroke="#FFF" strokeWidth={1} shadowColor="#000" shadowBlur={3} shadowOpacity={0.3} />
                  <Text
                    text="+"
                    fontSize={16}
                    fill="#FFFFFF"
                    width={24}
                    height={24}
                    offsetX={12}
                    offsetY={12}
                    align="center"
                    verticalAlign="middle"
                    listening={false}
                  />
                </Group>
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
      {selectedNodeId && nodes.find((n) => n.id === selectedNodeId) && (
        <motion.div
          className="fixed top-12 left-100 transform -translate-x-1/2 bg-white dark:bg-neutral-800 border border-pastel-pink rounded-lg p-3 shadow-xl z-20 flex items-center space-x-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <button
            className="px-3 py-1 bg-pastel-pink text-white rounded hover:bg-pink-400 transition-colors"
            onClick={toggleShape}
          >
            Form
          </button>
          <input
            title="Fill color"
            type="color"
            value={nodes.find((node) => node.id === selectedNodeId)?.color || "#FFFFFF"}
            onChange={(e) => updateNode({ color: e.target.value })}
            className="w-7 h-7 p-0 border-none rounded cursor-pointer"
          />
          <label className="text-xs text-neutral-600 dark:text-neutral-300">Edge:</label>
          <input
            title="Thickness"
            type="range"
            min="0"
            max="10"
            value={nodes.find((node) => node.id === selectedNodeId)?.borderWidth || 0}
            onChange={(e) => updateNode({ borderWidth: parseInt(e.target.value) })}
            className="w-20 h-5 cursor-pointer"
          />
          <input
            title="Edge color"
            type="color"
            value={nodes.find((node) => node.id === selectedNodeId)?.borderColor || "#F9E1E6"}
            onChange={(e) => updateNode({ borderColor: e.target.value })}
            className="w-7 h-7 p-0 border-none rounded cursor-pointer"
          />
          <label className="text-xs text-neutral-600 dark:text-neutral-300">Text:</label>
          <input
            title="Text size"
            type="range"
            min="8"
            max="32"
            value={nodes.find((node) => node.id === selectedNodeId)?.fontSize || 16}
            onChange={(e) => updateNode({ fontSize: parseInt(e.target.value) })}
            className="w-20 h-5 cursor-pointer"
          />
          <button
            className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 transition-colors"
            onClick={() => {
              const newText = prompt("Введите новый Text узла:", nodes.find((n) => n.id === selectedNodeId)?.text);
              if (newText !== null) updateNode({ text: newText });
            }}
          >
            Text
          </button>
          <button
            className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-500 transition-colors"
            onClick={openLinkPanel}
          >
            Connect
          </button>
          <button
            className="px-3 py-1 bg-red-400 text-white rounded hover:bg-red-500 transition-colors"
            onClick={() => {
              if (window.confirm(`Delete узел "${nodes.find((n) => n.id === selectedNodeId)?.text}"?`)) {
                setNodes(nodes.filter((n) => n.id !== selectedNodeId));
                setEdges(edges.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId));
                setSelectedNodeId(null);
              }
            }}
          >
            Delete
          </button>
        </motion.div>
      )}
      {isLinkPanelOpen && (
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-800 border border-pastel-pink rounded-lg p-4 shadow-xl z-30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Выберите узел для связи</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {nodes
              .filter((node) => node.id !== selectedNodeId)
              .map((node) => (
                <li
                  key={node.id}
                  onClick={() => selectNodeForLink(node.id)}
                  className="cursor-pointer p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  {node.text} (ID: {node.id})
                </li>
              ))}
          </ul>
          <button
            onClick={closeLinkPanel}
            className="mt-4 w-full bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-4 py-2 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default TwoDGraphs;