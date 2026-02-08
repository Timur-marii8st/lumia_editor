import React from "react";
import type { Block } from "../../types";

interface DividerBlockProps {
  block: Block;
}

export const DividerBlock: React.FC<DividerBlockProps> = () => {
  return (
    <div className="py-2">
      <hr className="border-t border-neutral-300 dark:border-neutral-600" />
    </div>
  );
};
