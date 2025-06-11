import {inject, Injectable} from '@angular/core';
import {ApiService} from "../api.service";
import {track} from "../../types/track.interface";
import {AudioPlayerService} from "../audio-player/audio-player.service";

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  api = inject(ApiService);
  songs: track[] = [];
  currentSong: string | null = null;

  constructor( protected audioService: AudioPlayerService) {}

  init() {
    this.loadLibrary();
  }

  refreshLibrary() {
    this.loadLibrary();
  }


  loadLibrary() {
    this.api.getSongs().subscribe({
      next: data => {
        this.songs = data;
        this.audioService.tracks = data; // garder les données synchronisées
      },
      error: err => console.error(err)
    });
  }



  deleteSong(id: string): void {
    this.api.deleteSong(id).subscribe({
      next: data => {
        console.log('Song deleted successfully', data);
        this.loadLibrary();
      },
      error: err => console.error('Error deleting song', err),
    });
  }

  onSongEnded() {
    this.currentSong = null;
  }
}
