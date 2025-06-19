const { Router } = require("express");
const prisma = require("../../prisma/prismaClient");
const fs = require("fs");
const path = require("path");
const { deleteTrackFromLibrary , deleteDocumentFromAllIndexes} = require("../lib/meiliSync");

const router = Router();
function sanitizeBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === "bigint" ? Number(value) : value
    ));
}
// GET /api/songs - Lire toutes les chansons
router.get("/", async (req, res) => {
    try {
        const songs = await prisma.song.findMany({
            orderBy: { createdAt: "desc" },
        });

        res.json(sanitizeBigInt(songs)); // 👈 correction ici
    } catch (error) {
        console.error("Erreur GET /api/songs:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des chansons" });
    }
});

// GET /api/songs/:id - Lire une chanson par ID
router.get("/:id", async (req, res) => {
    try {
        const song = await prisma.song.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!song) return res.status(404).json({ error: "Chanson non trouvée" });
        res.json(song);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération de la chanson" });
    }
});

// POST /api/songs - Créer une nouvelle chanson
router.post("/", async (req, res) => {
    const { title, artist, url } = req.body;
    try {
        const newSong = await prisma.song.create({
            data: { title, artist, url },
        });
        res.status(201).json(newSong);
    } catch (error) {
        res.status(400).json({ error: "Erreur lors de la création de la chanson" });
    }
});

// PUT /api/songs/:id - Mettre à jour une chanson existante
router.put("/:id", async (req, res) => {
    const { title, artist, url } = req.body;
    try {
        const updatedSong = await prisma.song.update({
            where: { id: parseInt(req.params.id) },
            data: { title, artist, url },
        });
        res.json(updatedSong);
    } catch (error) {
        res.status(400).json({ error: "Erreur lors de la mise à jour de la chanson" });
    }
});

// DELETE /api/songs/:id - Supprimer une chanson + fichiers associés
router.delete("/:id", async (req, res) => {
    const songId = req.params.id;

    try {
        const song = await prisma.song.findUnique({
            where: { id: songId },
        });

        if (!song) {
            return res.status(404).json({ error: "Chanson non trouvée" });
        }

        // Fonction utilitaire pour supprimer un fichier de manière robuste
        const safeDelete = async (filePath) => {
            try {
                if (filePath) {
                    const absolutePath = path.join(__dirname, "../..", filePath);
                    if (fs.existsSync(absolutePath)) {
                        await fs.promises.unlink(absolutePath);
                        console.log(`Fichier supprimé : ${absolutePath}`);
                    } else {
                        console.warn(`Fichier non trouvé : ${absolutePath}`);
                    }
                }
            } catch (err) {
                console.error(`Erreur lors de la suppression de ${filePath}`, err);
            }
        };

        // Supprimer les fichiers
        await safeDelete(song.filePath);
        await safeDelete(song.thumbnail);

        // Supprimer les entrées de la table PlaylistSong associées à cette chanson
        await prisma.playlistSong.deleteMany({
            where: { songId: songId },
        });

        // Supprimer la chanson de la BDD
        await prisma.song.delete({
            where: { id: songId },
        });

        try{
            await deleteDocumentFromAllIndexes(songId)
        }catch (error) {
            console.error("Erreur lors de la suppression de la chanson de la bibliothèque Meilisearch", error);
        }

        res.status(204).send();
    } catch (error) {
        console.error("Erreur DELETE /songs/:id", error);
        res.status(500).json({ error: "Erreur lors de la suppression de la chanson" });
    }
});

module.exports = router;
