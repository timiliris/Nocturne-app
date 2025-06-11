const { Router } = require("express");
const prisma = require("../../prisma/prismaClient");

const router = Router();

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
        res.json(playlists);
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
        res.json(playlist);
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
        res.status(201).json(newPlaylist);
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
        res.json(updatedPlaylist);
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

        res.status(204).send();
    } catch (error) {
        console.error("Erreur lors de la suppression de la playlist :", error);
        res.status(500).json({ error: "Erreur lors de la suppression de la playlist" });
    }
});
// POST /api/playlists/:id/songs - Ajouter un son dans une playlist
router.post("/:id/songs", async (req, res) => {
    const { songId } = req.body; // ✅ on prend songId depuis le body
    const playlistId = req.params.id;

    if (!songId) {
        return res.status(400).json({ error: "songId est requis" });
    }

    try {
        const newLink = await prisma.playlistSong.create({
            data: {
                playlist: { connect: { id: playlistId } },
                song: { connect: { id: songId } },
            },
        });
        res.status(201).json(newLink);
    } catch (error) {
        console.error("Erreur lors de l'ajout du son :", error);
        res.status(400).json({ error: "Erreur lors de l'ajout du son à la playlist" });
    }
});

module.exports = router;
