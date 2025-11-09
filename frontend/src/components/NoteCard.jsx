import React from 'react';
import { CheckCircle2Icon, CircleDashed, CircleDotIcon, PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";

const statusColors = {
  'pending': 'badge-warning',
  'in-progress': 'badge-info',
  'completed': 'badge-success'
};

const statusIcons = {
  'pending': CircleDashed,
  'in-progress': CircleDotIcon,
  'completed': CheckCircle2Icon
};

const NoteCard = ({ note, setNotes }) => {
  // compute progress percent: prefer subtasks if present
  const computeProgress = (note) => {
    const subs = note.subtasks || [];
    if (subs.length) {
      const completed = subs.filter((s) => s.completed).length;
      return Math.round((completed / subs.length) * 100);
    }
    // fallback to status mapping
    if (note.status === 'completed') return 100;
    if (note.status === 'in-progress') return 50;
    return 0;
  };

  const progress = computeProgress(note);
  const deriveStatus = (note) => {
    const subs = note.subtasks || [];
    if (subs.length) {
      const completed = subs.filter((s) => s.completed).length;
      if (completed === subs.length) return 'completed';
      if (completed > 0) return 'in-progress';
      return 'pending';
    }
    return note.status || 'pending';
  };
  const displayStatus = deriveStatus(note);
  const handleDelete = async (e, id) => {
    e.preventDefault(); // get rid of the navigation behaviour

    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id)); // get rid of the deleted one
      toast.success("Note deleted successfully");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className={`card bg-base-100 hover:shadow-lg transition-all duration-200 border-t-4 border-solid ${
      (displayStatus === 'completed') ? 'border-success' :
      (displayStatus === 'in-progress') ? 'border-info' :
      'border-warning'
    }`}>
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-base-content">{note.title}</h3>
          <div className={`badge ${statusColors[displayStatus]} text-sm`}>{displayStatus}</div>
        </div>
        
        <Link to={`/note/${note._id}`} className="hover:underline">
          <p className="text-base-content/70 line-clamp-3">{note.content}</p>
        </Link>

        <div className="flex items-center gap-2 mt-2">
          <span className={`badge ${statusColors[displayStatus]} gap-1`}>
            {React.createElement(statusIcons[displayStatus], { className: 'size-3' })}
            {displayStatus}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full h-2 bg-base-200 rounded overflow-hidden">
            <div
              className="h-2 bg-primary"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
            />
          </div>
          <div className="text-xs text-base-content/60 mt-1">{progress}% complete</div>
        </div>

        <div className="card-actions justify-between items-center mt-4">
          <span className="text-sm text-base-content/60">
            {formatDate(new Date(note.createdAt))}
          </span>
          <div className="flex items-center gap-2">
            <Link to={`/note/${note._id}`} className="btn btn-ghost btn-xs">
              <PenSquareIcon className="size-4" />
            </Link>
            <button
              className="btn btn-ghost btn-xs text-error"
              onClick={(e) => handleDelete(e, note._id)}
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NoteCard;