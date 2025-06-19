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
const path = require("path");
require("dotenv").config();
const app = express();

app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        'http://localhost:4200',
        'http://192.168.129.30:4200',
        'chrome-extension://*',
        'https://www.youtube.com',
        'https://youtube.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // passe à true si HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 jour
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
