const { Router } = require("express");
const { exec } = require("child_process");

const router = Router();

router.post("/", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "Missing YouTube URL" });
    }

    // Vérifie si l'URL est probablement de YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
    if (!youtubeRegex.test(url)) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Utilisation de yt-dlp pour récupérer les métadonnées
    exec(`yt-dlp -j ${url}`, (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return res.status(500).json({ error: "yt-dlp failed", details: stderr });
        }

        let info;
        try {
            info = JSON.parse(stdout);
        } catch (parseError) {
            return res.status(500).json({ error: "Failed to parse yt-dlp JSON output" });
        }

        // Helper format duration
        const formatDuration = (seconds) => {
            if (!seconds) return "N/A";
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, "0")}`;
        };

        // Helper format views
        const formatViews = (views) => {
            if (!views) return "N/A";
            if (views >= 1_000_000) return (views / 1_000_000).toFixed(1) + "M vues";
            if (views >= 1_000) return (views / 1_000).toFixed(1) + "K vues";
            return views + " vues";
        };

        const formattedInfo = {
            title: info.title || "Titre non disponible",
            thumbnail: info.thumbnail || "",
            duration: formatDuration(info.duration),
            views: formatViews(info.view_count),
            artist: info.artist || info.uploader || "Auteur inconnu",
            description: info.description || "Aucune description disponible"
        };

        res.json({ videoInfo: formattedInfo });
    });
});

module.exports = router;
