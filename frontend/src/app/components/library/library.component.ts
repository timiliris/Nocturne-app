import {environment} from "../../../environments/environment.prod";
import {HttpClient} from "@angular/common/http";
import {AudioPlayerService} from "../../services/audio-player/audio-player.service";
import {track} from "../../types/track.interface";
import {Component, inject, OnInit} from "@angular/core";
import {ApiService} from "../../services/api.service";
import {IonItemOption, IonItemOptions, IonItemSliding} from "@ionic/angular/standalone";
import { IonIcon, IonImg, IonItem, IonLabel, IonList, IonText, IonThumbnail} from "@ionic/angular/standalone";
import {NgForOf, NgIf} from "@angular/common";
import {AddInPlaylistComponent} from "../playlist/add-in-playlist/add-in-playlist.component";
import {LibraryService} from "../../services/library/library.service";

@Component({
  selector: 'app-library',
  imports: [
    IonList,
    IonItem,
    NgIf,
    NgForOf,
    IonThumbnail,
    IonIcon,
    IonLabel,
    IonText,
    IonImg,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    AddInPlaylistComponent,
  ],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css'] // <-- correction ici
})
export class LibraryComponent implements OnInit {

  api = inject(ApiService);
  library = inject(LibraryService);
  songs: track[] = [];
  currentSong: string | null = null;

  constructor(private http: HttpClient, protected audioService: AudioPlayerService) {}

  ngOnInit() {
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

  getIMGUrl(filePath: string): string {
    const apiBaseUrl = environment.apiUrl;
    return apiBaseUrl + filePath;
  }

  playSong(filePath: string, title: string, artist: string, thumbnail: string) {
    const apiBaseUrl = environment.apiUrl;
    const fullSrc = apiBaseUrl + filePath;

    const index = this.songs.findIndex(song => apiBaseUrl + song.filePath === fullSrc);
    if (index !== -1) {
      this.audioService.tracks = this.songs; // en cas de reload
      this.audioService.setCurrentTrackIndex(index);
      this.audioService.playCurrent();
      this.currentSong = fullSrc;
    }
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
