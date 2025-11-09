
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import api from "../lib/axios";

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState('pending');
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      // Only send non-empty subtasks
      const payload = {
        title,
        content,
        status,
        subtasks: (subtasks || []).map((s) => ({ title: s.title.trim(), completed: !!s.completed })).filter(s => s.title),
      };

      await api.post("/notes", payload);

      toast.success("Task created successfully!");
      navigate("/");
    } catch (error) {
      console.log("Error creating Task", error);
      if (error.response?.status === 429) {
        toast.error("Slow down! You're creating tasks too fast", {
          duration: 4000,
          icon: "💀",
        });
      } else {
        toast.error("Failed to create Task");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to={"/"} className="btn btn-ghost mb-6">
            <ArrowLeftIcon className="size-5" />
            Back to Tasks
          </Link>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Create New Task</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Task Title"
                    className="input input-bordered"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Content</span>
                  </label>
                  <textarea
                    placeholder="Write your task here..."
                    className="textarea textarea-bordered h-32"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
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
                    <span className="label-text">Subtasks (optional)</span>
                  </label>
                  <div className="space-y-2">
                    {(subtasks || []).map((s, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          placeholder={`Subtask ${idx + 1}`}
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
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Creating..." : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreatePage;
