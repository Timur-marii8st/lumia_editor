import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HotkeysProvider } from "react-hotkeys-hook";
import { ThemeProvider } from "@/providers/themeProvider";

// Styles
import "@/styles/globals.css";
import "@lumia/ui/dist/index.css";

// Components
import Sidebar from "@/components/sidebar";
import ErrorElement from "@/components/errorElement";
import Providers from "@/components/providers";

// Pages
import Home from "@/routes";
import Settings from "@/routes/settings";
import Editor from "@/routes/editor";
import ChatPage from "@/components/pages/chat";
import MiaChat from "@/components/miachat/miaChat";
import CalendarPage from "@/components/pages/CalendarPage";
import VisualSpace from "@/components/pages/visualSpace";

// Router configuration
const router = createBrowserRouter([
  {
    element: <Sidebar />,
    errorElement: <ErrorElement />,
    children: [
      { index: true, element: <Home /> },
      { path: "settings", element: <Settings /> },
      { path: "editor", element: <Editor /> },
      { path: "chat", element: <ChatPage /> },
      { path: "mia-chat", element: <MiaChat /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "/visual-space/*", element: <VisualSpace /> },
    ],
  },
]);

// Render application
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HotkeysProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Providers />
      </ThemeProvider>
    </HotkeysProvider>
  </React.StrictMode>
);
