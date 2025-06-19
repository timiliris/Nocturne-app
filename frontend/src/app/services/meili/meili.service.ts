import {Injectable} from '@angular/core';
import {MeiliSearch} from 'meilisearch';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MeiliService {
  private client: MeiliSearch;

  constructor() {
    console.log('Meili URL : ', environment.meilisearchUrl);
    console.log('Meili Api Key : ', environment.meilisearchApiKey);
    console.log('Api URL : ', environment.apiUrl);
    this.client = new MeiliSearch({
      host: environment.meilisearchUrl || 'http://localhost:7700', // Remplace par ton URL Meilisearch
      apiKey: environment.meilisearchApiKey ||  'MASTER_KEY' // Optionnel si tu utilises une clé
    });
  }

  // 🔎 Rechercher une chanson
  async searchSongs(query: string, limit = 20) {
    const index = this.client.index('track_library');
    return await index.search(query, { limit });
  }

  // 🎵 Récupérer une chanson par ID
  async getSongById(id: string) {
    const index = this.client.index('track_library');
    return await index.getDocument(id);
  }

  // 📀 Récupérer une playlist par ID
  async getPlaylistById(id: string) {
    const index = this.client.index('playlists');
    return await index.getDocument(id);
  }

  // 🔁 Récupérer toutes les chansons d’une playlist
  async getSongsFromPlaylist(playlistId: string): Promise<any[]> {
    const playlist = await this.getPlaylistById(playlistId);
    const songIds: string[] = playlist['songIds'];

    if (!songIds?.length) return [];

    const index = this.client.index('track_library');

    // Récupérer les infos de chaque chanson
    return await Promise.all(songIds.map(id => index.getDocument(id)));
  }
}
