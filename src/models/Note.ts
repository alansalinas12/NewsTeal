import mongoose from "mongoose";

export type NoteModel = mongoose.Document & {
    title: string,
    body: string
};

const noteSchema = new mongoose.Schema({
    title: String,
    body: String
});

const Note = mongoose.model("Note", noteSchema);
export default Note;