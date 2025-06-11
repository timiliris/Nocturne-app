// src/middleware/auth.js
const BASIC_USER = process.env.GLOBAL_USERNAME;
const BASIC_PASS = process.env.GLOBAL_PASSWORD;

function basicAuth(req, res, next) {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Basic ")) {
        return res.sendStatus(401);
    }

    const [user, pass] = Buffer.from(auth.split(" ")[1], "base64")
        .toString()
        .split(":");

    if (user === BASIC_USER && pass === BASIC_PASS) {
        return next();
    }

    return res.sendStatus(403);
}
function requireAuth(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        return next();
    } else {
        return res.status(401).json({ error: "Unauthorized" });
    }
}

module.exports = { basicAuth, requireAuth };