"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bson_1 = require("bson");
const articleSchema = new mongoose_1.default.Schema({
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
        type: bson_1.ObjectId,
        ref: "Note"
    }
});
const Article = mongoose_1.default.model("Article", articleSchema);
exports.default = Article;
//# sourceMappingURL=Article.js.map