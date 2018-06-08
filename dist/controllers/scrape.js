"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const Article_1 = __importDefault(require("../models/Article"));
const Note_1 = __importDefault(require("../models/Note"));
/**
 * GET /scrape
 * Scrape website
 */
exports.getScrape = (req, res, next) => {
    // First, we grab the body of the html with request
    axios_1.default.get("http://www.echojs.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        const $ = cheerio_1.default.load(response.data);
        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function (i, element) {
            // Save an empty result object
            const article = new Article_1.default();
            // Add the text and href of every link, and save them as properties of the result object
            article.title = $(this)
                .children("a")
                .text();
            article.link = $(this)
                .children("a")
                .attr("href");
            // Create a new Article using the `result` object built from scraping
            Article_1.default.create(article)
                .then(function (dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
            })
                .catch(function (err) {
                // If an error occurred, send it to the client
                return res.json(err);
            });
        });
        // If we were able to successfully scrape and save an Article, send a message to the client
        res.send("Scrape Complete");
    });
};
/**
 * GET /articles
 * Get all articles from db
 */
exports.getArticles = (req, res) => {
    // Grab every document in the Articles collection
    Article_1.default.find({})
        .then(function (dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
    })
        .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
};
/**
 * GET /articles/:id
 * Get a specific article and populate with it's note
 */
exports.getArticle = (req, res) => {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article_1.default.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
    })
        .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
};
/**
 * POST /articles
 * Post or update article notes
 */
exports.postArticle = (req, res) => {
    // Create a new note and pass the req.body to the entry
    Note_1.default.create(req.body)
        .then(function (dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return Article_1.default.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
        .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
    })
        .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
};
//# sourceMappingURL=scrape.js.map