const { Router } = require("express");
const prisma = require("../../prisma/prismaClient");
const { syncPlaylistCreate , addTrackToPlaylist, removeTrackFromPlaylist, syncPlaylistDelete } = require("../lib/meiliSync");
const router = Router();

function bigIntToString(obj) {
    if (Array.isArray(obj)) {
        return obj.map(bigIntToString);
    } else if (obj !== null && typeof obj === "object") {
        const newObj = {};
        for (const key in obj) {
            if (typeof obj[key] === "bigint") {
                newObj[key] = obj[key].toString();
            } else if (typeof obj[key] === "object") {
                newObj[key] = bigIntToString(obj[key]);
            } else {
                newObj[key] = obj[key];
            }
        }
        return newObj;
    }
    return obj;
}

// GET /api/playlists - Toutes les playlists
router.get("/", async (req, res) => {
    try {
        const playlists = await prisma.playlist.findMany({
            include: {
                songs: {
                    include: { song: true },
                },
            },
        });
        res.json(bigIntToString(playlists));
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des playlists" });
    }
});

// GET /api/playlists/:id - Playlist par ID
router.get("/:id", async (req, res) => {
    try {
        const playlist = await prisma.playlist.findUnique({
            where: { id: req.params.id },
            include: {
                songs: {
                    include: { song: true },
                },
            },
        });
        if (!playlist) return res.status(404).json({ error: "Playlist non trouvée" });
        res.json(bigIntToString(playlist));
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération de la playlist" });
    }
});

// POST /api/playlists - Créer une playlist avec couleur
router.post("/", async (req, res) => {
    const { name, color = "#000000", songIds = [] } = req.body;
    try {
        const newPlaylist = await prisma.playlist.create({
            data: {
                name,
                color,
                songs: {
                    create: songIds.map(songId => ({
                        song: { connect: { id: songId } },
                    })),
                },
            },
            include: {
                songs: {
                    include: { song: true },
                },
            },
        });
        try {
            await syncPlaylistCreate(newPlaylist);
        } catch (meiliError) {
            console.warn("Meilisearch sync failed:", meiliError);
        }
        res.status(201).json(bigIntToString(newPlaylist));
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Erreur lors de la création de la playlist" });
    }
});

// PUT /api/playlists/:id - Mettre à jour nom, couleur, chansons
router.put("/:id", async (req, res) => {
    const { name, color = "#000000", songIds = [] } = req.body;
    try {
        // Supprimer les anciennes liaisons
        await prisma.playlistSong.deleteMany({
            where: { playlistId: req.params.id },
        });

        const updatedPlaylist = await prisma.playlist.update({
            where: { id: req.params.id },
            data: {
                name,
                color,
                songs: {
                    create: songIds.map(songId => ({
                        song: { connect: { id: songId } },
                    })),
                },
            },
            include: {
                songs: {
                    include: { song: true },
                },
            },
        });
        res.json(bigIntToString(updatedPlaylist));
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Erreur lors de la mise à jour de la playlist" });
    }
});

// DELETE /api/playlists/:id - Supprimer une playlist
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.playlistSong.deleteMany({
            where: { playlistId: id },
        });

        await prisma.playlist.delete({
            where: { id },
        });

        try {
            await syncPlaylistDelete(id);
        }catch (error) {
            console.warn("Meilisearch sync failed:", error);
        }

        res.status(204).send();
    } catch (error) {
        console.error("Erreur lors de la suppression de la playlist :", error);
        res.status(500).json({ error: "Erreur lors de la suppression de la playlist" });
    }
});

// POST /api/playlists/:id/songs - Add a song to a playlist
router.post("/:id/songs", async (req, res) => {
    const { songId } = req.body;
    const playlistId = req.params.id;

    if (!songId) {
        return res.status(400).json({ error: "songId is required" });
    }

    try {
        // Check if the song is already in the playlist
        const existing = await prisma.playlistSong.findFirst({
            where: {
                playlistId,
                songId,
            },
        });

        if (existing) {
            return res.status(409).json({
                error: "The song is already in this playlist.",
            });
        }

        try{
            await addTrackToPlaylist(playlistId, songId);
        }catch (error) {
            console.error("Error syncing playlist with Meilisearch:", error);
        }

        // Create the link between playlist and song
        const newLink = await prisma.playlistSong.create({
            data: {
                playlist: { connect: { id: playlistId } },
                song: { connect: { id: songId } },
            },
        });

        res.status(201).json(bigIntToString(newLink));
    } catch (error) {
        console.error("Error adding song to playlist:", error);
        res.status(500).json({ error: "Internal error while adding the song to the playlist." });
    }
});

// DELETE /api/playlists/:id/songs/:songId - Supprimer une chanson d'une playlist
router.delete("/:id/songs/:songId", async (req, res) => {
    const playlistId = req.params.id;
    const songId = req.params.songId;

    try {
        // Vérifie si le lien existe
        const link = await prisma.playlistSong.findFirst({
            where: {
                playlistId,
                songId,
            },
        });

        if (!link) {
            return res.status(404).json({ error: "Cette chanson n'est pas dans la playlist." });
        }

        // Supprime le lien
        await prisma.playlistSong.delete({
            where: {
                id: link.id,
            },
        });

        // Sync avec Meilisearch
        try {
            await removeTrackFromPlaylist(playlistId, songId);
        } catch (meiliError) {
            console.warn("Erreur de synchronisation Meilisearch :", meiliError);
        }

        res.status(204).send();
    } catch (error) {
        console.error("Erreur lors de la suppression de la chanson :", error);
        res.status(500).json({ error: "Erreur interne lors de la suppression de la chanson." });
    }
});


module.exports = router;
