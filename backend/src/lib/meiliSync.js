const meili = require("./meiliClient");

async function deletePlaylistIndex() {
    try {
        await meili.deleteIndex("playlists");
        console.log("✅ Index 'playlists' supprimé avec succès.");
    } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'index :", error);
    }
}
async function deleteLibraryIndex() {
    try {
        await meili.deleteIndex("library");
        console.log("✅ Index 'library' supprimé avec succès.");
    } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'index :", error);
    }
}
async function deleteTrackLibraryIndex() {
    try {
        await meili.deleteIndex("track_library");
        console.log("✅ Index 'track_library' supprimé avec succès.");
    } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'index :", error);
    }
}


async function ensurePlaylistIndexConfigured() {
    const indexName = "playlists";
    const existingIndexes = await meili.getIndexes();
    const alreadyExists = existingIndexes.results.some(i => i.uid === indexName);

    const index = meili.index(indexName);

    if (!alreadyExists) {
        // Création implicite en ajoutant des documents plus tard
        // On configure immédiatement après
        await index.updateFilterableAttributes(["id"]);
        await index.updateSortableAttributes(["name"]);
        await index.updateSearchableAttributes(["name"]);
    }

    return index;
}

async function ensureTrackLibraryIndexConfigured() {
    const indexName = "track_library";
    const existingIndexes = await meili.getIndexes();
    const alreadyExists = existingIndexes.results.some(i => i.uid === indexName);

    const index = meili.index(indexName);

    if (!alreadyExists) {
        // Création implicite en ajoutant des documents plus tard
        // On configure immédiatement après
        await index.updateFilterableAttributes(["id"]);
        await index.updateSortableAttributes(["title"]);
        await index.updateSearchableAttributes(["artist"]);
        await index.updateSearchableAttributes(["description"]);
    }

    return index;
}

async function addTrackToLibrary(track) {
    await ensureTrackLibraryIndexConfigured();
    await meili.index("track_library").addDocuments(track);
}

async function deleteTrackFromLibrary(id) {
    await meili.index("track_library").deleteDocument(id);
}

async function deleteDocumentFromAllIndexes(id) {
    try {
        const indexes = await meili.getIndexes()

        for (const index of indexes.results) {
            console.log(`🧹 Deleting documents from index: ${index.uid}`)
            const idsToDelete = Array.isArray(id) ? id : [id]
            const task = await meili.index(index.uid).deleteDocuments(idsToDelete)
            console.log(`📌 Task enqueued for ${index.uid}: ${task.taskUid}`)
        }

        console.log(`✅ ${id} deleted from all indexes`)
    } catch (error) {
        console.error(`❌ Failed to delete ${id} from all indexes:`, error)
    }
}
/**
 * Sync a new playlist to Meilisearch
 */
async function syncPlaylistCreate(playlist) {
    const index = await ensurePlaylistIndexConfigured();
    await meili.index("playlists").addDocuments([
        {
            id: playlist.id,
            name: playlist.name,
            color: playlist.color,
            songIds: playlist.songs.map(p => p.songId),
        },
    ]);
}

/**
 * Sync an updated playlist to Meilisearch
 */
async function syncPlaylistUpdate(playlist) {
    await meili.index("playlists").updateDocuments([
        {
            id: playlist.id,
            name: playlist.name,
            color: playlist.color,
            songIds: playlist.songs.map(p => p.songId),
        },
    ]);
}

async function addTrackToPlaylist(playlistId, trackId) {
    const index = meili.index("playlists");

    // 1. Récupérer la playlist existante
    const { results } = await index.getDocuments({
        filter: `id = "${playlistId}"`,
        limit: 1,
    });

    const playlist = results[0];

    if (!playlist) {
        throw new Error("Playlist not found");
    }

    // 2. Ajouter le track s’il n’y est pas déjà
    const updatedSongIds = Array.from(new Set([...(playlist.songIds || []), trackId]));

    // 3. Mettre à jour la playlist
    await index.updateDocuments([
        {
            id: playlistId,
            songIds: updatedSongIds,
        },
    ]);
}

async function removeTrackFromPlaylist(playlistId, trackId) {
    const index = meili.index("playlists");

    // 1. Récupérer la playlist existante
    const { results } = await index.getDocuments({
        filter: `id = "${playlistId}"`,
        limit: 1,
    });

    const playlist = results[0];

    if (!playlist) {
        throw new Error("Playlist not found");
    }

    // 2. Filtrer le trackId à retirer
    const updatedSongIds = (playlist.songIds || []).filter(id => id !== trackId);

    // 3. Mettre à jour la playlist dans Meilisearch
    await index.updateDocuments([
        {
            id: playlistId,
            songIds: updatedSongIds,
        },
    ]);
}


/**
 * Remove a playlist from Meilisearch
 */
async function syncPlaylistDelete(id) {
    await meili.index("playlists").deleteDocument(id);
}

module.exports = {
    deleteDocumentFromAllIndexes,
    addTrackToLibrary,
    deleteTrackFromLibrary,
    syncPlaylistCreate,
    removeTrackFromPlaylist,
    addTrackToPlaylist,
    ensurePlaylistIndexConfigured,
    ensureTrackLibraryIndexConfigured,
    syncPlaylistUpdate,
    syncPlaylistDelete,
};
