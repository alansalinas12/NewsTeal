"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
    res.render("index", {
        title: "Home"
    });
};
exports.dashboard = (req, res) => {
    res.render("dashboard", {
        title: "Dashboard"
    });
};
//# sourceMappingURL=home.js.map