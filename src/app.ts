import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongo from "connect-mongo";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import expressValidator from "express-validator";
import flash from "express-flash";

const MongoStore = mongo(session);

dotenv.config({ path: "../.env" });

import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as scrapeController from "./controllers/scrape";

import * as passportConfig from "./config/passport";

const app = express();

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/NewsTeal";

const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, { useMongoClient: true }).then(
    () => { }, ).catch(err => {
        console.log("MongoDB connection error." + err);
        process.exit();
    });

// Express config
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "handlebars");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(expressValidator());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: mongoUrl,
        autoReconnect: true
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
        req.path !== "/login" &&
        req.path !== "/signup" &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    } else if (req.user &&
        req.path == "/account") {
        req.session.returnTo = req.path;
    }
    next();
});

app.use(express.static(path.join(__dirname, "public")));

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);
app.get("/scrape", passportConfig.isAuthenticated, scrapeController.getScrape);
app.get("/articles", passportConfig.isAuthenticated, scrapeController.getArticles);
app.get("/articles/:id", passportConfig.isAuthenticated, scrapeController.getArticle);
app.post("/articles", passportConfig.isAuthenticated, scrapeController.postArticle);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    res.redirect(req.session.returnTo || "/");
});


export default app;