import NoteVersion from "../models/noteVersionModel.js";

export const fetchNoteversions = async (req, res) => {
    const { noteId } = req.params;

    try {
      const note = await NoteVersion.find({noteId});
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

    //   console.log(note);
      res.status(200).json({ versions: note || [] });
    } catch (error) {
      console.error("Error fetching note versions:", error);
      res.status(500).json({ message: "Server Error" });
    }
};
