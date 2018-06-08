import passport from "passport";
import request from "request";
import passportLocal from "passport-local";
import passportGoogle from "passport-google-oauth";
import _ from "lodash";

import { default as User } from "../models/User";
import { Request, Response, NextFunction } from "express";

const LocalStrategy = passportLocal.Strategy;
const GoogleStrategy = passportGoogle.OAuth2Strategy;

passport.serializeUser<any, any>((user, done) => {
    done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
        if (err) { return done(err); }
        if (!user) {
            return done(undefined, false, { message: `Email ${email} not found.` });
        }
        user.comparePassword(password, (err: Error, isMatch: boolean) => {
            if (err) { return done(err); }
            if (isMatch) {
                return done(undefined, user);
            }
            return done(undefined, false, { message: "Invalid email or password." });
        });
    });
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
}, (req: any, accessToken, refreshToken, profile, done) => {

    if (req.user) {
        User.findOne({ google: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
                req.flash("errors", { msg: "There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
                done(err);
            } else {
                User.findById(req.user.id, (err, user: any) => {
                    if (err) { return done(err); }
                    user.google = profile.id;
                    user.tokens.push({ kind: "google", accessToken });
                    user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;

                    user.save((err: Error) => {
                        req.flash("info", { msg: "Google account has been linked." });
                        done(err, user);
                    });
                });
            }
        });
    } else {
        User.findOne({ google: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
                return done(undefined, existingUser);
            }
            User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
                if (err) { return done(err); }
                if (existingEmailUser) {
                    req.flash("errors", { msg: "There is already an account using this email address." });
                    done(err);
                } else {
                    const user: any = new User();
                    user.email = profile._json.email;
                    user.google = profile.id;
                    user.tokens.push({ kind: "google", accessToken });
                    user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;

                    user.save((err: Error) => {
                        done(err, user);
                    });
                }
            });
        });
    }
}));


/**
 * Login Required middleware.
 */
export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

/**
 * Authorization Required middleware.
 */
export let isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.path.split("/").slice(-1)[0];

    if (_.find(req.user.tokens, { kind: provider })) {
        next();
    } else {
        res.redirect(`/auth/${provider}`);
    }
};