
import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('pending');
  const [subtasks, setSubtasks] = useState([]);

  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote(res.data);
      setStatus(res.data.status || 'pending');
      setSubtasks(res.data.subtasks || []);
      } catch (error) {
        console.log("Error in fetching task", error);
        toast.error("Failed to fetch the task");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.delete(`/notes/${id}`);
      toast.success("task deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleSave = async () => {
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Please add a title or content");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...note,
        status,
        subtasks: (subtasks || []).map(s => ({ title: s.title?.trim() || '', completed: !!s.completed })).filter(s => s.title),
      };
      await api.put(`/notes/${id}`, payload);
      toast.success("task updated successfully");
      navigate("/");
    } catch (error) {
      console.log("Error saving the task:", error);
      toast.error("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <LoaderIcon className="animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Tasks
            </Link>
            <button onClick={handleDelete} className="btn btn-error btn-outline">
              <Trash2Icon className="h-5 w-5" />
              Delete Task
            </button>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="task title"
                  className="input input-bordered"
                  value={note.title}
                  onChange={(e) => setNote({ ...note, title: e.target.value })}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Content</span>
                </label>
                <textarea
                  placeholder="Write your task here..."
                  className="textarea textarea-bordered h-32"
                  value={note.content}
                  onChange={(e) => setNote({ ...note, content: e.target.value })}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Subtasks</span>
                </label>
                <div className="space-y-2">
                  {(subtasks || []).map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={!!s.completed}
                        onChange={() => {
                          const copy = [...subtasks];
                          copy[idx] = { ...copy[idx], completed: !copy[idx].completed };
                          setSubtasks(copy);
                        }}
                      />
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={s.title}
                        onChange={(e) => {
                          const copy = [...subtasks];
                          copy[idx] = { ...copy[idx], title: e.target.value };
                          setSubtasks(copy);
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost text-error"
                        onClick={() => setSubtasks((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setSubtasks((prev) => [...(prev || []), { title: '', completed: false }])}
                  >
                    Add Subtask
                  </button>
                </div>
              </div>

              <div className="card-actions justify-end">
                <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NoteDetailPage;
