import "./App.css";
import { OperationView } from './views/Operation/OperationView';
import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "./components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex h-screen w-screen p-2 bg-background rounded-lg text-foreground shadow-lg shadow-gray-900/20 border border-gray-700/50">
            <AppSidebar />
            <main className="flex flex-col w-full h-full rounded-lg">
              <div className="flex flex-row px-1 items-center w-fullrounded-lg">
                <SidebarTrigger />
                {/* <p>Hello world</p> */}
              </div>
              <div className="flex flex-1 w-full rounded-lg">
                <OperationView />
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
