import mongoose from "mongoose";
import { ObjectId } from "bson";

export type ArticleModel = mongoose.Document & {
    title: {
        type: string,
        required: boolean
    },

    link: {
        type: string,
        required: boolean
    },

    note: {
        type: ObjectId,
        ref: string
    }
};

const articleSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    // `link` is required and of type String
    link: {
        type: String,
        required: true
    },
    // `note` is an object that stores a Note id
    // The ref property links the ObjectId to the Note model
    // This allows us to populate the Article with an associated Note
    note: {
        type: String,
        ref: "Note"
    }
});

const Article = mongoose.model("Article", articleSchema);
export default Article;