const  meili = require("../lib/meiliClient"); // ton client MeiliSearch
const {ensurePlaylistIndexConfigured, ensureTrackLibraryIndexConfigured} = require("../lib/meiliSync");
const prisma = require("../../prisma/prismaClient"); // ton instance Prisma

async function syncPlaylistsAndSongs() {
    await ensurePlaylistIndexConfigured();
    await ensureTrackLibraryIndexConfigured();

    const songsIndex = meili.index("track_library");
    const playlistsIndex = meili.index("playlists");

    // Récupère les documents déjà présents dans MeiliSearch (ID uniquement)
    const existingSongs = await songsIndex.getDocuments({ fields: ["id"], limit: 10000 });
    const existingPlaylists = await playlistsIndex.getDocuments({ fields: ["id"], limit: 10000 });

    const existingSongIds = new Set(existingSongs.results.map(s => s.id));
    const existingPlaylistIds = new Set(existingPlaylists.results.map(p => p.id));

    // Récupère les chansons et playlists depuis ta base de données via Prisma
    const dbSongs = await prisma.song.findMany();
    const dbPlaylists = await prisma.playlist.findMany({
        include: { songs: true },
    });

    // Filtre uniquement les nouveaux documents (ceux non indexés)
    const newSongs = dbSongs.filter(song => !existingSongIds.has(song.id));
    const newPlaylists = dbPlaylists.filter(playlist => !existingPlaylistIds.has(playlist.id));

    // Ajoute les nouveaux songs
    if (newSongs.length > 0) {
        await songsIndex.addDocuments(newSongs.map(song => ({
            id: song.id.toString(),
            title: song.title,
            artist: song.artist,
            filePath: song.filePath,
            thumbnail: song.thumbnail,
            youtubeUrl: song.youtubeUrl,
            description: song.description,
            views: Number(song.views),
            duration: Number(song.duration),
        })));
    }

    // Ajoute les nouvelles playlists
    if (newPlaylists.length > 0) {
        await playlistsIndex.addDocuments(newPlaylists.map(playlist => ({
            id: playlist.id.toString(),
            name: playlist.name,
            color: playlist.color,
            songIds: playlist.songs.map(s => s.songId)
        })));
    }

    console.log(`✅ Synced ${newSongs.length} songs and ${newPlaylists.length} playlists`);
}

module.exports = syncPlaylistsAndSongs;