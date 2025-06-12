const { Router } = require("express");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const https = require("https");
const prisma = require("../../prisma/prismaClient");

const router = Router();

function sanitizeBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === "bigint" ? Number(value) : value
    ));
}
function runYtDlpInfo(url, useTor = false) {
    const proxy = useTor ? '--proxy socks5h://tor:9050' : '';
    return new Promise((resolve, reject) => {
        exec(`yt-dlp ${proxy} -j ${url}`, (err, stdout, stderr) => {
            if (err) return reject({ err, stderr });
            try {
                const info = JSON.parse(stdout);
                resolve(info);
            } catch (e) {
                reject({ err: e, stderr: "Failed to parse JSON" });
            }
        });
    });
}

function downloadAudio(url, filePath, useTor = false) {
    const proxy = useTor ? '--proxy socks5h://tor:9050' : '';
    return new Promise((resolve, reject) => {
        const cmd = `yt-dlp ${proxy} -f bestaudio --extract-audio --audio-format mp3 -o "${filePath}" ${url}`;
        exec(cmd, (err, stdout, stderr) => {
            if (err) return reject({ err, stderr });
            resolve();
        });
    });
}


router.post("/", async (req, res) => {
    const { url } = req.body;

    if (!url) return res.status(400).json({ error: "Missing YouTube URL" });

    const id = uuidv4();
    const downloadsDir = path.resolve("downloads");
    const thumbnailsDir = path.join(downloadsDir, "thumbnails");

    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
    if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

    const filePath = path.join(downloadsDir, `${id}.mp3`);
    const thumbnailPath = path.join(thumbnailsDir, `${id}.jpg`);

    let info;
    try {
        info = await runYtDlpInfo(url);
    } catch (firstErr) {
        console.warn("Normal fetch failed, retrying via Tor...");
        try {
            info = await runYtDlpInfo(url, true);
        } catch (torErr) {
            console.error("Both attempts failed:", torErr.stderr);
            return res.status(500).json({ error: "Failed to fetch video info", details: torErr.stderr });
        }
    }

    const title = info.title || `Song ${id}`;
    const artist = info.artist || info.uploader || "Unknown";
    const thumbnailUrl = info.thumbnail;
    const description = info.description || "No description available";
    const views = info.view_count || 0;
    const duration = info.duration || 0;

    const downloadThumbnail = () => {
        return new Promise((resolve) => {
            if (!thumbnailUrl) return resolve(null);
            const file = fs.createWriteStream(thumbnailPath);
            https.get(thumbnailUrl, (response) => {
                if (response.statusCode !== 200) return resolve(null);
                response.pipe(file);
                file.on("finish", () => file.close(() => resolve(`/downloads/thumbnails/${id}.jpg`)));
            }).on("error", (err) => {
                console.error("Thumbnail download error:", err);
                resolve(null);
            });
        });
    };

    try {
        await downloadAudio(url, filePath); // 1ère tentative sans Tor
    } catch (firstErr) {
        console.warn("Audio download failed, retrying via Tor...");
        try {
            await downloadAudio(url, filePath, true);
        } catch (torErr) {
            console.error("Both audio attempts failed:", torErr.stderr);
            return res.status(500).json({ error: "yt-dlp failed", details: torErr.stderr });
        }
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

        res.json({ message: "Download complete", song: sanitizeBigInt(song) });
    } catch (dbError) {
        console.error(dbError);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
