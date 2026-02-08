import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@lumia/ui";
import { ollamaManager, type OllamaStatus } from "@/lib/ai/ollama-manager";
import { useOllamaStore } from "@/store/ollamaStore";

interface OllamaLaunchButtonProps {
  onStatusChange?: (status: OllamaStatus) => void;
  className?: string;
}

export const OllamaLaunchButton: React.FC<OllamaLaunchButtonProps> = ({
  onStatusChange,
  className,
}) => {
  const [status, setStatus] = useState<OllamaStatus>({
    isInstalled: false,
    isRunning: false,
    models: [],
  });
  const [isStarting, setIsStarting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedModel, setSelectedModel } = useOllamaStore();

  useEffect(() => {
    // Initial status check
    checkStatus();

    // Start monitoring
    ollamaManager.startMonitoring((newStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    }, 5000);

    return () => {
      ollamaManager.stopMonitoring();
    };
  }, []);

  const checkStatus = async () => {
    const newStatus = await ollamaManager.getStatus();
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);

    const result = await ollamaManager.start();

    if (result.success) {
      // Wait a bit and check status
      setTimeout(async () => {
        await checkStatus();
        setIsStarting(false);
      }, 2000);
    } else {
      setError(result.message);
      setIsStarting(false);
    }
  };

  const getButtonContent = () => {
    if (isStarting) {
      return (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
          <span>Starting AI...</span>
        </>
      );
    }

    if (!status.isInstalled) {
      return (
        <>
          <AlertCircle className="w-5 h-5" />
          <span>Ollama Not Installed</span>
        </>
      );
    }

    if (status.isRunning) {
      return (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
          </motion.div>
          <span>AI Ready</span>
        </>
      );
    }

    return (
      <>
        <Sparkles className="w-5 h-5" />
        <span>Launch AI</span>
      </>
    );
  };

  const getButtonVariant = () => {
    if (!status.isInstalled) return "destructive";
    if (status.isRunning) return "default";
    return "default";
  };

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Button
          onClick={() => {
            if (!status.isInstalled) {
              window.open("https://ollama.ai", "_blank");
            } else if (!status.isRunning) {
              handleStart();
            } else {
              setShowDetails(!showDetails);
            }
          }}
          disabled={isStarting}
          variant={getButtonVariant()}
          className={`
            relative overflow-hidden
            ${status.isRunning ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" : ""}
            ${isStarting ? "cursor-wait" : ""}
            transition-all duration-300
          `}
        >
          {/* Animated background for starting state */}
          {isStarting && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ width: "200%" }}
            />
          )}

          {/* Button content */}
          <div className="relative z-10 flex items-center space-x-2">
            {getButtonContent()}
          </div>

          {/* Pulse effect when running */}
          {status.isRunning && !isStarting && (
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-lg"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}
        </Button>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 left-0 right-0 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details panel */}
        <AnimatePresence>
          {showDetails && status.isRunning && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 shadow-xl z-50 min-w-[300px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Ollama Status
                  </h3>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-purple-500" />
                  </motion.div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Server:</span>
                    <span className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      <span>Running</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Models:</span>
                    <span className="text-neutral-900 dark:text-neutral-100">
                      {status.models.length}
                    </span>
                  </div>
                </div>

                {status.models.length > 0 && (
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                      Available models:
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {status.models.map((model) => (
                        <button
                          key={model}
                          onClick={() => setSelectedModel(model)}
                          className={`
                            w-full text-left text-xs px-2 py-1 rounded transition-colors
                            ${selectedModel === model 
                              ? "bg-purple-500 text-white" 
                              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                            }
                          `}
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {status.models.length === 0 && (
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                      No models installed. Pull a model:
                    </p>
                    <code className="text-xs bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded block">
                      ollama pull llama3.2
                    </code>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
