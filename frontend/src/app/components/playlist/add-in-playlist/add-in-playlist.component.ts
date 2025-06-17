import {Component, inject, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {PlaylistService} from "../../../services/playlist/playlist.service";
import {
  IonButton,
  IonButtons, IonContent,
  IonHeader,
  IonItem, IonLabel, IonList,
  IonTitle,
  IonToolbar, ModalController
} from "@ionic/angular/standalone";
import {ToastService} from "../../../services/toast/toast.service";
@Component({
  selector: 'app-add-in-playlist',
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonList, IonItem, IonLabel],
  templateUrl: './add-in-playlist.component.html',
  styleUrls: ['./add-in-playlist.component.css']
})
export class AddInPlaylistComponent {
  playlistService = inject(PlaylistService);
  private modalCtrl = inject(ModalController);
  private toastService = inject(ToastService);

  @Input() songId!: string;
  @Input() slot!: 'start' | 'end';

  isSelectorOpen = false;

  constructor() {}

  confirm() {
    return this.modalCtrl.dismiss(null, 'confirm');
  }


  onPlaylistSelect(playlistId: string) {
      this.addSongToPlaylist(playlistId);
      this.isSelectorOpen = false;
  }

  addSongToPlaylist(playlistId: string) {
    this.playlistService.addSongToPlaylist(playlistId, this.songId).subscribe({
      next: async () => {
        await this.toastService.successToast('Song Added to the playlist');
        console.log(`Chanson ajoutée à la playlist ${playlistId}`);
        this.playlistService.refreshPlaylists()
      },
      error: async (err) => {
        console.error(err);
        await this.toastService.errorToast('Error adding song to playlist. ' + err.error.error);
        console.error('Erreur lors de l\'ajout de la chanson', err);
      }
    });
  }
}
