const express = require("express");
const downloadRouter = require("./routes/download");
const libraryRouter = require("./routes/library");
const previewRouter = require("./routes/preview");
const playlistRouter = require("./routes/playlist");
const authRouter = require("./routes/auth");
const {requireAuth } = require("./middleware/auth");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const syncPlaylistsAndSongs = require("./middleware/syncMeilisearchIndexes");
const path = require("path");
require("dotenv").config();
const app = express();
(async () => {
    try {
        await syncPlaylistsAndSongs();
        console.log("✅ Synchronisation Meilisearch terminée");
    } catch (error) {
        console.error("❌ Erreur lors de la synchronisation Meilisearch:", error);
    }
})();
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.SESSION_SECURE === 'true',
        httpOnly: process.env.SESSION_HTTP_ONLY !== 'false',
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000
    }
}));
// Serve static downloads folder for MP3 files
app.use('/downloads', express.static(path.join(__dirname, '../downloads')));

// Protect all API routes with basic auth
app.use('/auth', authRouter);
app.use('/api', requireAuth);
app.use('/api/preview', previewRouter);
app.use('/api/download', downloadRouter);
app.use('/api/library', libraryRouter);
app.use('/api/playlists', playlistRouter);

module.exports = app;
