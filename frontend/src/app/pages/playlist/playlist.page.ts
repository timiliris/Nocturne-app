import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonImg,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonText,
  IonThumbnail,
  IonFabButton, IonFab
} from '@ionic/angular/standalone';

import { PlaylistService } from '../../services/playlist/playlist.service';
import {AddInPlaylistComponent} from "../../components/playlist/add-in-playlist/add-in-playlist.component";
import {AudioPlayerService} from "../../services/audio-player/audio-player.service";
import {ApiService} from "../../services/api.service";
import {environment} from "../../../environments/environment.prod";
import {track} from "../../types/track.interface";
import {HeaderComponent} from "../../components/header/header.component";
interface Playlist {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  songs: {
    playlistId: string;
    songId: string;
    song: {
      id: string;
      title: string;
      artist: string;
      filePath: string;
      youtubeUrl: string;
      thumbnail: string;
      description: string;
      duration: number;
      views: number;
      createdAt: string;
    };
  }[];
}

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.page.html',
  styleUrls: ['./playlist.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    CommonModule,
    FormsModule,
    AddInPlaylistComponent,
    IonButton,
    IonIcon,
    IonImg,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonText,
    IonThumbnail,
    IonFabButton,
    IonFab,
    HeaderComponent
  ]
})
export class PlaylistPage implements OnInit {
  playlistId: string | null = null;
  playlist: any = null;
  isLoading = false;
  songs: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.playlistId = params.get('id');
      if (this.playlistId) {
        this.loadPlaylist(this.playlistId);
      }
    });
  }
  private audioService = inject(AudioPlayerService);
  api = inject(ApiService);
  currentSong: string | null = null;
  getIMGUrl(filePath: string): string {
    const apiBaseUrl = environment.apiUrl;
    return apiBaseUrl + filePath;
  }

  playPlaylist() {
    this.audioService.loadPlaylist(this.playlist);
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
        this.loadPlaylist(this.playlistId || '');
      },
      error: err => console.error('Error deleting song', err),
    });
  }
  loadPlaylist(id: string) {
    this.isLoading = true;
    this.playlistService.getPlaylist(id).subscribe({
      next: (data) => {
        this.playlist = data;
        this.songs = data.songs.map((entry: any) => entry.song); // 👈 extract actual song objects
        this.isLoading = false;
        console.log('Playlist chargée:', this.playlist);
        console.log('Chansons extraites:', this.songs);
      },
      error: (err) => {
        console.error('Erreur de chargement de la playlist', err);
        this.isLoading = false;
      }
    });
  }
}
