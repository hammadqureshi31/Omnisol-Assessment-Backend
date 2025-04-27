import mongoose from "mongoose";

const noteVersionSchema = new mongoose.Schema(
  {
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const NoteVersion = mongoose.model("NoteVersion", noteVersionSchema);
export default NoteVersion;
