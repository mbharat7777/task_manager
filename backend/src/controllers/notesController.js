
import Note from "../models/Note.js";

export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 }); // -1 will sort in desc. order (newest first)
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getAllNotes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getNoteById(req, res) {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found!" });
    res.json(note);
  } catch (error) {
    console.error("Error in getNoteById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createNote(req, res) {
  try {
    const { title, content, status } = req.body;

    // basic validation
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });

    // Validate status if provided
    const allowedStatuses = ['pending', 'in-progress', 'completed'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const note = new Note({
      title,
      content,
      status: status || 'pending',
      user: req.user.id
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error in createNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateNote(req, res) {
  try {
    const { title, content, status } = req.body;
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Validate status if provided
    const allowedStatuses = ['pending', 'in-progress', 'completed'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    note.title = title ?? note.title;
    note.content = content ?? note.content;
    if (status) note.status = status;
    const updatedNote = await note.save();

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error in updateNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteNote(req, res) {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json({ message: "Note deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
