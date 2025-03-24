import "./App.css";
import { SideBarView } from "./views/SideBar/SideBarView";
import { OperationView } from './views/Operation/OperationView';

function App() {
  return (
    <div className="flex h-screen w-screen p-1.5 gap-1 bg-background text-foreground relative">
      <SideBarView />
      <OperationView />
    </div>
  );
}

export default App;
