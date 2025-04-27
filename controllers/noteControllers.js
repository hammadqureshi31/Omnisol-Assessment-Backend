import Note from "../models/noteModel.js";
import bcrypt from "bcrypt";
import NoteVersion from "../models/noteVersionModel.js";

export const createNote = async (req, res) => {
  const { title, description, protected: isProtected, password } = req.body;
  const userId = req.valideUser?._id;

  console.log(title, description, isProtected, password, userId);

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and Description are required." });
  }

  try {
    let hashedPassword = null;

    if (isProtected) {
      if (!password) {
        return res
          .status(400)
          .json({ message: "Password is required for protected note." });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newNote = new Note({
      title,
      description,
      protected: isProtected,
      password: hashedPassword,
      createdBy: userId,
    });

    await newNote.save();

    // Emit real-time event using Socket.IO
    req.app
      .get("io")
      .emit("noteCreated", { title: newNote.title, createdBy: userId });

    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchNotes = async (req, res) => {
  const { page = 0 } = req.query;
  const limit = 8;

  try {
    const totalCount = await Note.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);
    //   const currentPage = Math.min(Math.max(parseInt(page), 1), totalPages);
    const skip = page * limit;

    const notes = await Note.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      notes,
      pagination: {
        totalCount,
        page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in fetching notes:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;

  try {
    const resp = await Note.findByIdAndDelete(noteId);
    console.log(resp);

    req.app
      .get("io")
      .emit("noteDeleted", { title: resp.title, deleteBy: resp.createdBy });
    res.status(200).send("note deleted successfully");
  } catch (error) {
    console.error("Error in deleting note:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editNote = async (req, res) => {
  const { noteId } = req.params;
  const { title, description, protected: isProtected, password } = req.body;

  try {
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and Description are required." });
    }

    const noteToEdit = await Note.findById(noteId);

    if (!noteToEdit) {
      return res.status(404).json({ message: "Note not found." });
    }

    // Saving the current version before update
    const newVersionNote = {
      noteId: noteToEdit._id,
      title: noteToEdit.title,
      description: noteToEdit.description,
    };

    await NoteVersion.create(newVersionNote);


    noteToEdit.title = title;
    noteToEdit.description = description;
    noteToEdit.protected = isProtected || false;

    if (isProtected) {
      if (!password) {
        return res
          .status(400)
          .json({ message: "Password is required for protected note." });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      noteToEdit.password = hashedPassword;
    } else {
      noteToEdit.password = null;
    }

    await noteToEdit.save();

    res
      .status(200)
      .json({ message: "Note updated successfully.", updatedNote: noteToEdit });
  } catch (error) {
    console.error("Error in updating note:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
