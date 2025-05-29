import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { getCurrent } from "@tauri-apps/api/window";
import { cn, Button, buttonVariants } from "@lumia/ui";
import { Plus, Folders, Home, Sparkles, Calendar, Layout } from "lucide-react";
import { useAppStore } from "@/store/appStore";

import Search from "@/components/search";
import SidebarGroup from "@/components/sidebar/sidebarGroup";
import Explorer from "@/components/explorer";
import CreateFile from "@/components/file/createFile";
import ManageWorkspaces from "@/components/workspaces/manageWorkspaces";
import UserSettings from "@/components/settings/userSettings";

import {
  SidebarItemClasses,
  SidebarItemIconSize,
  SidebarLinkActiveClasses,
} from "./shared";

const appWindow = getCurrent();

// Sidebar Config:
const [minWidth, maxWidth, defaultWidth] = [200, 300, 208];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const route = useLocation();
  const openDrawer = useAppStore((state) => state.openDrawer);

  const [width, setWidth] = useState<number>(defaultWidth);
  const isResized = useRef(false);

  // Resize sidebar:
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResized.current) return;
      setWidth((prev) => {
        const next = prev + e.movementX / 2;
        return next >= minWidth && next <= maxWidth ? next : prev;
      });
    };
    const onMouseUp = () => {
      isResized.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <main className="min-h-screen">
      {/* Sidebar without animation */}
      {openDrawer && (
        <nav
          className={cn(
            "fixed left-0 top-0 h-full flex flex-col px-4 pb-3 pt-5",
            "overflow-y-auto overflow-x-hidden",
            "bg-neutral-200/40 dark:bg-neutral-800/20",
            "border-r border-neutral-300/50 dark:border-neutral-800"
          )}
          style={{ width: `${width / 16}rem` }}
        >
          <div className="flex w-full flex-1 flex-col">
            <SidebarGroup border>
              <Link
                to="/"
                onClick={() => appWindow.setTitle("Main - Lumia")}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  SidebarItemClasses,
                  route.pathname === "/" ? SidebarLinkActiveClasses : ""
                )}
              >
                <div className="flex items-center space-x-3 transition">
                  <Home size={SidebarItemIconSize} />
                  <span>Main</span>
                </div>
              </Link>

              <motion.button
                onClick={() => {
                  appWindow.setTitle("Chat - Lumia");
                  navigate("/chat");
                }}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  SidebarItemClasses,
                  "rainbow-glow"
                )}
                initial={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
                whileHover={{ boxShadow: "0 0 10px rgba(255,255,255,0.6)" }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
              >
                <div className="flex items-center space-x-3">
                  <Sparkles size={SidebarItemIconSize} />
                  <span>Chat with Mia</span>
                </div>
              </motion.button>

              <Link
                to="/calendar"
                onClick={() => appWindow.setTitle("Calendar - Lumia")}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  SidebarItemClasses,
                  route.pathname === "/calendar" ? SidebarLinkActiveClasses : ""
                )}
              >
                <div className="flex items-center space-x-3 transition">
                  <Calendar size={SidebarItemIconSize} />
                  <span>Calendar</span>
                </div>
              </Link>

              <Link
                to="/visual-space"
                onClick={() => appWindow.setTitle("Visual Space - Lumia")}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  SidebarItemClasses,
                  route.pathname === "/visual-space" ? SidebarLinkActiveClasses : ""
                )}
              >
                <div className="flex items-center space-x-3 transition">
                  <Layout size={SidebarItemIconSize} />
                  <span>Visual Space</span>
                </div>
              </Link>

              <CreateFile
                trigger={
                  <Button variant="ghost" className={SidebarItemClasses}>
                    <div className="flex items-center space-x-3 transition">
                      <Plus size={SidebarItemIconSize} />
                      <span>New Note</span>
                    </div>
                  </Button>
                }
              />

              <ManageWorkspaces
                trigger={
                  <Button variant="ghost" className={SidebarItemClasses}>
                    <div className="flex items-center space-x-3 transition">
                      <Folders size={SidebarItemIconSize} />
                      <span>Workspaces</span>
                    </div>
                  </Button>
                }
              />

              <Search />
            </SidebarGroup>

            <SidebarGroup title="Workspaces">
              <Explorer />
            </SidebarGroup>
          </div>

          <div className="flex flex-col space-y-2">
            <UserSettings />
          </div>

          <div
            className={cn(
              "absolute bottom-0 right-0 top-0 w-1 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800/50 cursor-ew-resize"
            )}
            onMouseDown={() => {
              isResized.current = true;
            }}
          />
        </nav>
      )}

      <div
        style={{
          marginLeft: openDrawer ? `${width / 16}rem` : "0px",
        }}
      >
        <Outlet />
      </div>
    </main>
  );
};

export default Sidebar;