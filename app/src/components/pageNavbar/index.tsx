import type { ReactNode } from "react";
import { cn, buttonVariants, Button } from "@lumia/ui";
import { SidebarClose, SidebarOpen, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/appStore";

interface PageNavbarProps {
  title: string;
  border?: boolean;
  close?: boolean;
  children?: ReactNode;
}

const PageNavbar = (props: PageNavbarProps) => {
  const toggleDrawer = useAppStore((state) => state.toggleDrawer);
  const openDrawer = useAppStore((state) => state.openDrawer);

  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col bg-neutral-100 dark:bg-neutral-900">
      <div
        className={cn(
          "flex w-full items-center justify-between py-1 pr-2",
          props.border
            ? "border-b border-neutral-300/50 pb-1 dark:border-neutral-800"
            : "",
        )}
      >
        <div className="flex items-center space-x-2">
          {/* Закрепленная кнопка для открытия/закрытия боковой панели */}
          <div className="fixed top-0.7 left-100 z-50">
            <Button
              variant="ghost"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  className:
                    "p-1 text-neutral-400 hover:bg-transparent dark:text-neutral-500 dark:hover:bg-transparent",
                }),
                "rounded-full"
              )}
              size="icon"
              onClick={() => toggleDrawer()}
            >
              {openDrawer ? (
                <SidebarClose size={14} />
              ) : (
                <SidebarOpen size={14} />
              )}
            </Button>
          </div>
          {/* Отступ, чтобы заголовок не перекрывался кнопкой */}
          <div className="pl-10">
            <p className="text-sm text-neutral-800 dark:text-neutral-300">
              {props.title}
            </p>
          </div>
        </div>
        {props.close && (
          <Link
            to="/"
            className={buttonVariants({
              variant: "ghost",
              className: "rounded-full p-2",
              size: "icon",
            })}
          >
            <X size={16} />
          </Link>
        )}
      </div>
      <div>{props.children}</div>
    </nav>
  );
};

export default PageNavbar;