import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "../utils/cn";

// Типы для пропсов Textarea
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

// Компонент Textarea
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "w-full rounded-md border border-neutral-300/50 bg-neutral-200 px-3 py-2 text-sm",
          "text-neutral-800 placeholder:text-neutral-500",
          "focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400",
          "dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 dark:placeholder:text-neutral-400",
          "dark:focus:ring-pink-500 dark:focus:border-pink-600",
          "min-h-[100px] resize-y",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };