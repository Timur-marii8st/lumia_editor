// src/lib/ui/AvatarFallback.tsx
import { forwardRef, HTMLAttributes } from "react";
import { cn } from "..";

interface AvatarFallbackProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const AvatarFallback = forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center w-full h-full text-sm font-medium",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AvatarFallback.displayName = "AvatarFallback";

export { AvatarFallback };