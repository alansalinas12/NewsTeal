import axios from "axios";
import cheerio from "cheerio";
import { Request, Response, NextFunction } from "express";
import { default as Article, ArticleModel } from "../models/Article";

/**
 * GET /scrape
 * Scrape website
 */
export let getScrape = (req: Request, res: Response, next: NextFunction) => {
    // First, we grab the body of the html with request
    axios.get("http://www.echojs.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function (i, element) {
            // Save an empty result object
            var article: any = new Article();

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