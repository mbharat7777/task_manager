import { useState } from "react";
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI";
import { useEffect } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import NoteCard from "../components/NoteCard";
import NotesNotFound from "../components/NotesNotFound";
import { CheckCircle2Icon, CircleDashed, CircleDotIcon } from "lucide-react";

const HomePage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes");
        console.log(res.data);
        setNotes(res.data);
        setIsRateLimited(false);
      } catch (error) {
        console.log("Error fetching notes");
        console.log(error.response);
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to load notes");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // group notes by status for dashboard sections
  const pendingTasks = notes.filter((n) => n.status === 'pending');
  const inProgressTasks = notes.filter((n) => n.status === 'in-progress');
  const completedTasks = notes.filter((n) => n.status === 'completed');

  return (
    <div className="min-h-screen">
      <Navbar />

      {isRateLimited && <RateLimitedUI />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && <div className="text-center text-primary py-10">Loading task...</div>}

        {notes.length === 0 && !isRateLimited && <NotesNotFound />}

        {!isRateLimited && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Tasks</div>
                  <div className="stat-value">{notes.length}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Pending</div>
                  <div className="stat-value text-warning">{pendingTasks.length}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">In Progress</div>
                  <div className="stat-value text-info">{inProgressTasks.length}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Completed</div>
                  <div className="stat-value text-success">{completedTasks.length}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {pendingTasks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-warning">
                    <CircleDashed className="size-5" />
                    Pending Tasks
                    <span className="text-sm font-normal">({pendingTasks.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingTasks.map((note) => (
                      <NoteCard key={note._id} note={note} setNotes={setNotes} />
                    ))}
                  </div>
                </div>
              )}

              {inProgressTasks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-info">
                    <CircleDotIcon className="size-5" />
                    In Progress
                    <span className="text-sm font-normal">({inProgressTasks.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inProgressTasks.map((note) => (
                      <NoteCard key={note._id} note={note} setNotes={setNotes} />
                    ))}
                  </div>
                </div>
              )}

              {completedTasks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-success">
                    <CheckCircle2Icon className="size-5" />
                    Completed
                    <span className="text-sm font-normal">({completedTasks.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedTasks.map((note) => (
                      <NoteCard key={note._id} note={note} setNotes={setNotes} />
                    ))}
                  </div>
                </div>
              )}

              {notes.length === 0 && <NotesNotFound />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default HomePage;