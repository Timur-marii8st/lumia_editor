import { forwardRef, HTMLAttributes } from "react";
import { cn } from "..";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  src?: string;
  alt?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 overflow-hidden",
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt || "Avatar"} className="w-full h-full object-cover" />
        ) : (
          children
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };