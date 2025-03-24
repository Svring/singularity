import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { ThemeProvider } from "./components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          <App />
        </main>
      </SidebarProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
