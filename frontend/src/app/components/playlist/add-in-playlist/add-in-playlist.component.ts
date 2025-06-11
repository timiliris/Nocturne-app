import {Component, inject, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Playlist, PlaylistService} from "../../../services/playlist/playlist.service";
import {IonButton, IonIcon, IonItemOption, IonSelect, IonSelectOption, IonText} from "@ionic/angular/standalone";
 // adapte le chemin

@Component({
  selector: 'app-add-in-playlist',
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonIcon, IonSelect, IonSelectOption, IonItemOption, IonText],
  templateUrl: './add-in-playlist.component.html',
  styleUrls: ['./add-in-playlist.component.css']
})
export class AddInPlaylistComponent implements OnInit {
  playlistService = inject(PlaylistService); // Assurez-vous que le service est injecté correctement

  @Input() songId!: string;

  playlists: Playlist[] = [];
  selectedPlaylistId: string | null = null;
  isSelectorOpen = false;
  isLoading = false;

  constructor() {}

  ngOnInit() {
    this.loadPlaylists();
  }

  loadPlaylists() {
    this.isLoading = true;
    this.playlistService.getPlaylists().subscribe({
      next: (data) => {
        this.playlists = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des playlists', err);
        this.isLoading = false;
      }
    });
  }

  openSelector() {
    this.isSelectorOpen = true;
  }

  onPlaylistChange(event: any) {
    const playlistId = event.detail.value;
    if (playlistId) {
      this.addSongToPlaylist(playlistId);
      this.isSelectorOpen = false;
    }
  }

  addSongToPlaylist(playlistId: string) {
    this.playlistService.addSongToPlaylist(playlistId, this.songId).subscribe({
      next: () => {
        console.log(`Chanson ajoutée à la playlist ${playlistId}`);
        this.playlistService.refreshPlaylists()
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout de la chanson', err);
      }
    });
  }
}
