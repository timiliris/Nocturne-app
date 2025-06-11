const { Router } = require("express");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const https = require("https");
const prisma = require("../../prisma/prismaClient");

const router = Router();

router.post("/", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "Missing YouTube URL" });
    }

    const id = uuidv4();
    const downloadsDir = path.resolve("downloads");
    const thumbnailsDir = path.join(downloadsDir, "thumbnails");

    // Création des dossiers si nécessaires
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
    if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

    const filePath = path.join(downloadsDir, `${id}.mp3`);
    const thumbnailPath = path.join(thumbnailsDir, `${id}.jpg`);

    // 1. Récupérer les infos JSON de la vidéo
    exec(`yt-dlp -j ${url}`, (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return res.status(500).json({ error: "Failed to fetch video info", details: stderr });
        }

        let info;
        try {
            info = JSON.parse(stdout);
        } catch (e) {
            return res.status(500).json({ error: "Failed to parse video info JSON" });
        }

        const title = info.title || `Song ${id}`;
        const artist = info.artist || info.uploader || "Unknown";
        const thumbnailUrl = info.thumbnail;
        const description = info.description || "No description available";
        const views = info.view_count || 0;
        const duration = info.duration || 0;

        // 2. Télécharger la miniature si elle existe
        const downloadThumbnail = () => {
            return new Promise((resolve, reject) => {
                if (!thumbnailUrl) return resolve(null);

                const file = fs.createWriteStream(thumbnailPath);
                https.get(thumbnailUrl, (response) => {
                    if (response.statusCode !== 200) {
                        return resolve(null); // Continue sans thumbnail
                    }

                    response.pipe(file);
                    file.on("finish", () => file.close(() => resolve(`/downloads/thumbnails/${id}.jpg`)));
                }).on("error", (err) => {
                    console.error("Thumbnail download error:", err);
                    resolve(null); // Ignore l’erreur pour ne pas bloquer
                });
            });
        };

        // 3. Télécharger le son en MP3
        const cmd = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 -o "${filePath}" ${url}`;

        exec(cmd, async (error, stdout2, stderr2) => {
            if (error) {
                console.error(stderr2);
                return res.status(500).json({ error: "yt-dlp failed", details: stderr2 });
            }

            const thumbnailRelPath = await downloadThumbnail();

            try {
                const song = await prisma.song.create({
                    data: {
                        id,
                        title,
                        artist,
                        filePath: `/downloads/${id}.mp3`,
                        thumbnail: thumbnailRelPath,
                        youtubeUrl: url,
                        description,
                        views,
                        duration
                    },
                });

                console.log("Inserted song in DB:", song);
                res.json({ message: "Download complete", song });
            } catch (dbError) {
                console.error(dbError);
                res.status(500).json({ error: "Database error" });
            }
        });
    });
});

module.exports = router;
