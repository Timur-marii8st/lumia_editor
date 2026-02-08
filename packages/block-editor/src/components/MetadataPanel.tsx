import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, X, Plus, Calendar, User, FileText } from "lucide-react";

interface Metadata {
  title?: string;
  author?: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
  description?: string;
}

interface MetadataPanelProps {
  metadata: Metadata;
  onChange: (metadata: Metadata) => void;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({ metadata, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      onChange({
        ...metadata,
        tags: [...metadata.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    onChange({
      ...metadata,
      tags: metadata.tags.filter((t) => t !== tag),
    });
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-40 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
      >
        <FileText className="w-4 h-4" />
        Metadata
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-32 right-4 z-40 w-80 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-xl p-4"
          >
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={metadata.title || ""}
                  onChange={(e) => onChange({ ...metadata, title: e.target.value })}
                  placeholder="Document title"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Author
                </label>
                <input
                  type="text"
                  value={metadata.author || ""}
                  onChange={(e) => onChange({ ...metadata, author: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  value={metadata.description || ""}
                  onChange={(e) => onChange({ ...metadata, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </label>
                
                {/* Tag list */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add tag */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    placeholder="Add tag"
                    className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dates */}
              {(metadata.createdAt || metadata.updatedAt) && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {metadata.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Created: {new Date(metadata.createdAt).toLocaleDateString()}
                    </div>
                  )}
                  {metadata.updatedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Updated: {new Date(metadata.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
