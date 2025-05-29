import React from 'react';

interface ImageSizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSizeSelect: (scale: number) => void;
}

const ImageSizeDialog: React.FC<ImageSizeDialogProps> = ({ isOpen, onClose, onSizeSelect }) => {
  if (!isOpen) return null;

  const sizes = [
    { name: 'Very Small', scale: 0.25 },
    { name: 'Small', scale: 0.5 },
    { name: 'Normal', scale: 1 },
    { name: 'Large', scale: 2 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-lg">
        <h3 className="mb-4">Select image size:</h3>
        <div className="flex gap-2">
          {sizes.map((size) => (
            <button
              key={size.name}
              onClick={() => {
                onSizeSelect(size.scale);
                onClose();
              }}
              className="px-3 py-2 border rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {size.name}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-3 py-2 border rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageSizeDialog;