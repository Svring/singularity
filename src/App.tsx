import "./App.css";
import { SideBarView } from "./views/SideBar/SideBarView";
import { OperationView } from './views/Operation/OperationView';

function App() {

  return (
    <div className="flex h-screen w-screen p-1.5 gap-1 bg-[rgba(6,10,17,0.66)] rounded-xl border border-[rgba(255,255,255,0.125)]">
      <SideBarView />
      <OperationView />
    </div>
  );
}

export default App;
