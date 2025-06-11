const { Router } = require("express");
const router = Router();
require("dotenv").config();

const USERNAME = process.env.GLOBAL_USERNAME;
const PASSWORD = process.env.GLOBAL_PASSWORD;

router.post("/", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
    }

    if (username === USERNAME && password === PASSWORD) {
        // Stocke l'état dans la session
        req.session.isAuthenticated = true;
        req.session.username = username;

        return res.json({ message: "Authenticated successfully" });
    } else {
        return res.status(401).json({ error: "Invalid credentials" });
    }
});
router.get("/status", (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        return res.json({
            authenticated: true,
            username: req.session.username
        });
    } else {
        return res.json({ authenticated: false });
    }
});
router.post("/logout", (req, res) => {
    console.log('Cookies reçus:', req.headers.cookie);
    console.log('Session avant destruction:', req.session);

    req.session.destroy((err) => {
        if (err) {
            console.error("Session destruction failed:", err);
            return res.status(500).json({ error: "Failed to log out" });
        }

        res.clearCookie('connect.sid', { path: '/' });
        console.log('Cookie cleared');
        return res.json({ message: "Logged out successfully" });
    });
});
module.exports = router;
