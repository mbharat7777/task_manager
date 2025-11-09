import { Link } from "react-router-dom";
import { PlusIcon, LogOutIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <header className="bg-base-300 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary font-mono tracking-tight">Task Manager</h1>
          <div className="flex items-center gap-4">
            <Link to="/create" className="btn btn-primary">
              <PlusIcon className="size-5" />
              <span>Add Task</span>
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost">
              <LogOutIcon className="size-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;