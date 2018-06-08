import { Request, Response } from "express";

/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
    res.render("index", {
        title: "Home"
    });
};

export let dashboard = (req: Request, res: Response) => {
    res.render("dashboard", {
        title: "Dashboard"
    });
};