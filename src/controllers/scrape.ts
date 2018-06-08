import axios from "axios";
import cheerio from "cheerio";
import { Request, Response, NextFunction } from "express";
import { default as Article, ArticleModel } from "../models/Article";
import { default as Note, NoteModel } from "../models/Note";

/**
 * GET /scrape
 * Scrape website
 */
export let getScrape = (req: Request, res: Response, next: NextFunction) => {
    // First, we grab the body of the html with request
    axios.get("http://www.echojs.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        const $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function (i, element) {
            // Save an empty result object
            const article: any = new Article();

            // Add the text and href of every link, and save them as properties of the result object
            article.title = $(this)
                .children("a")
                .text();
            article.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            Article.create(article)
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
export let getArticles = (req: Request, res: Response) => {
    // Grab every document in the Articles collection
    Article.find({})
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
export let getArticle = (req: Request, res: Response) => {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({ _id: req.params.id })
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
export let postArticle = (req: Request, res: Response) => {
    // Create a new note and pass the req.body to the entry
    Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
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