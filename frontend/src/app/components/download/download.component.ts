import {Component, inject} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {
  IonButton, IonCardTitle, IonCardContent, IonInput, IonItem,
  IonSpinner, IonText,
  IonThumbnail, IonLabel, IonChip, IonIcon, IonCardHeader, IonImg, IonCol, IonRow, IonGrid
} from "@ionic/angular/standalone";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { addIcons } from 'ionicons';
import { playOutline, downloadOutline, timeOutline, eyeOutline } from 'ionicons/icons';
import {track} from "../../types/track.interface";
import {LibraryService} from "../../services/library/library.service";
import {environment} from "../../../environments/environment";


@Component({
  selector: 'app-download-component',
  imports: [
    IonItem, IonInput, IonButton, IonSpinner, IonText, IonCardContent, IonCardTitle, IonThumbnail,
    IonLabel, IonChip, IonIcon,
    FormsModule, NgIf, IonCardHeader, IonImg, IonCol, IonRow, IonGrid
  ],
  templateUrl: './download.component.html',
  styleUrl: './download.component.css'
})
export class DownloadComponent {

  libraryService = inject(LibraryService);

  url: string = '';
  downloading = false;
  loading = false;
  message = '';
  videoInfo!: track;
  showPreview = false;

  constructor(private http: HttpClient) {
    addIcons({ playOutline, downloadOutline, timeOutline, eyeOutline });
  }

  // Preview the video from the URL entered
  previewVideo() {
    if (!this.url) return;

    this.loading = true;
    this.message = '';

    this.http.post<any>(environment.apiUrl + '/api/preview', { url: this.url }, {
      withCredentials: true // Important pour envoyer le cookie !
    }).subscribe({
      next: res => {
        this.videoInfo = res.videoInfo as track;
        this.showPreview = true;
        this.message = '';
      },
      error: err => {
        this.message = 'Impossible de charger les informations de la vidéo';
        console.error(err);
        this.showPreview = false;
      },
      complete: () => this.loading = false
    });
  }

  // Download the song on the server
  downloadSong() {
    if (!this.url) return;

    this.downloading = true;
    this.message = '';

    this.http.post<any>(environment.apiUrl + '/api/download', { url: this.url }, {
      withCredentials: true
    }).subscribe({
      next: res => {
        this.message = 'Téléchargement terminé: ' + res.song.title;
        this.resetForm();
        this.libraryService.refreshLibrary()
      },
      error: err => {
        this.message = 'Échec du téléchargement';
        console.error(err);
      },
      complete: () => this.downloading = false
    });
  }

  // Reset of the form
  resetForm() {
    this.url = '';
    this.showPreview = false;
  }

  // Valid YouTube URL
  isValidYouTubeUrl(): boolean {
    if (!this.url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(this.url);
  }
}
