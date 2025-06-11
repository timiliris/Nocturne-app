import {
  Component,
  OnDestroy,
  OnInit,
  HostListener
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AudioPlayerService } from "../../services/audio-player/audio-player.service";
import { NgClass, NgIf, AsyncPipe } from "@angular/common";
import {
  IonButton,
  IonCard,
  IonCol,
  IonGrid, IonIcon,
  IonImg,
  IonRow
} from "@ionic/angular/standalone";
import { track } from "../../types/track.interface";

interface Playlist {
  songs: { song: track }[];
}

@Component({
  selector: 'app-audio-player',
  standalone: true,
  templateUrl: './audio-player.component.html',
  imports: [
    NgIf,
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    NgClass,
    AsyncPipe,
    IonButton,
    IonIcon
  ],
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  private sub: Subscription = new Subscription();
  isSmallScreen = window.innerWidth < 768;

  // Observables du service
  currentTrack$ = this.audioService.currentTrack;
  isPlaying$ = this.audioService.isPlaying;
  duration$ = this.audioService.duration;
  currentTime$ = this.audioService.currentTime;
  volume$ = this.audioService.volume;
  isMuted$ = this.audioService.isMuted;
  playlist$ = this.audioService.playlist;
  currentIndex$ = this.audioService.currentIndex;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isSmallScreen = window.innerWidth < 768;
  }

  constructor(private audioService: AudioPlayerService) {}

  ngOnInit() {
    // Le service gère maintenant tous les événements audio
    this.audioService.init();
  }

  // Méthodes déléguées au service
  loadPlaylist(playlist: Playlist) {
    this.audioService.loadPlaylist(playlist);
  }

  play(track: track) {
    this.audioService.play(track);
  }

  displayedTitle(): string {
    const maxLength = this.isSmallScreen ? 25 : 50;
    return this.audioService.displayedTitle(maxLength);
  }

  displayedArtist(): string {
    const maxLength = this.isSmallScreen ? 25 : 50;
    return this.audioService.displayedArtist(maxLength);
  }

  togglePlay() {
    this.audioService.togglePlay();
  }

  nextTrack() {
    this.audioService.nextTrack();
  }

  previousTrack() {
    this.audioService.previousTrack();
  }

  stop() {
    this.audioService.stop();
  }

  seek(event: any) {
    const time = parseFloat(event.target.value);
    this.audioService.seek(time);
  }

  setVolume(event: any) {
    const volume = parseFloat(event.target.value);
    this.audioService.setVolume(volume);
  }

  toggleMute() {
    this.audioService.toggleMute();
  }

  skipForward() {
    this.audioService.skipForward(15);
  }

  skipBackward() {
    this.audioService.skipBackward(15);
  }
  openOnYoutube() {
    const sub = this.currentTrack$.subscribe(track => {
      if (track && track.youtubeUrl) {
        window.open(track.youtubeUrl, '_blank');
      } else {
        console.warn('Aucun lien YouTube disponible pour la piste actuelle.');
      }
    });

    this.sub.add(sub);
  }


  getTrackName(): string {
    const maxLength = this.isSmallScreen ? 25 : 50;
    return this.audioService.getTrackName(maxLength);
  }

  formatTime(seconds: number): string {
    return this.audioService.formatTime(seconds);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
