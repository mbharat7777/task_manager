import mongoose from "mongoose";

// 1st step: You need to create a schema
// 2nd step: You would create a model based off of that schema

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    // New: subtasks support
    subtasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to compute progress percentage from subtasks
noteSchema.virtual('progress').get(function () {
  const subs = this.subtasks || [];
  if (!subs.length) {
    // Map status to default progress when no subtasks exist
    if (this.status === 'completed') return 100;
    if (this.status === 'in-progress') return 50;
    return 0;
  }
  const completed = subs.filter((s) => s.completed).length;
  return Math.round((completed / subs.length) * 100);
});

const Note = mongoose.model("Note", noteSchema);

export default Note;