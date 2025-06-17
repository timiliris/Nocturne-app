import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonFabButton, IonFab, IonSpinner
} from '@ionic/angular/standalone';

import { PlaylistService } from '../../services/playlist/playlist.service';
import {AudioPlayerService} from "../../services/audio-player/audio-player.service";
import {ApiService} from "../../services/api.service";
import {HeaderComponent} from "../../components/header/header.component";
import {Playlist} from "../../types/playlist.interface";
import {TracksDisplayComponent} from "../../components/tracks-display/tracks-display.component";
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
    IonIcon,
    IonFabButton,
    IonFab,
    HeaderComponent,
    TracksDisplayComponent,
    IonSpinner
  ]
})
export class PlaylistPage implements OnInit {
  playlistId: string | null = null;
  playlist: Playlist | null  = null;
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

  playPlaylist() {
    if(this.playlist){
      this.audioService.loadPlaylist(this.playlist);
    }

  }

  loadPlaylist(id: string) {
    this.isLoading = true;
    this.playlistService.getPlaylist(id).subscribe({
      next: (data) => {
        this.playlist = data; // 👈 assurez-vous que data est de type Playlist
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
