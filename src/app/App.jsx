import { Outlet } from "react-router-dom";
import {Toaster} from "../components/ui/sonner"

const App = () => {
  return (
    <div className="min-h-screen bg-neutral text-text-primary">
      <main className="p-4 sm:p-6 lg:p-8">
      <Toaster/>
        <Outlet />
      </main>
    </div>
  );
};

export default App;