import React from "react";
import { BlockEditor } from "@lumia/block-editor";

export const BlockEditorPage: React.FC = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-neutral-900">
      <BlockEditor
        className="h-full"
        onChange={(blocks) => {
          // Auto-save or handle changes
          console.log("Blocks changed:", blocks);
        }}
      />
    </div>
  );
};
