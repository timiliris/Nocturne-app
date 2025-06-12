import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { track } from "../../types/track.interface";
import {environment} from "../../../environments/environment.prod";

export interface AudioTrack {
  src: string;
  title?: string;
  artist?: string;
  thumbnail?: string;
}

export interface Playlist {
  songs: { song: track }[];
}

@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  api = inject(ApiService);
  apiUrl = environment.apiUrl ;
  private audio = new Audio();

  // BehaviorSubjects pour l'état
  private currentTrack$ = new BehaviorSubject<Partial<track> | null>(null);
  private isPlaying$ = new BehaviorSubject<boolean>(false);
  private duration$ = new BehaviorSubject<number>(0);
  private currentTime$ = new BehaviorSubject<number>(0);
  private volume$ = new BehaviorSubject<number>(1);
  private isMuted$ = new BehaviorSubject<boolean>(false);
  private playlist$ = new BehaviorSubject<track[]>([]);
  private currentIndex$ = new BehaviorSubject<number>(-1);

  // Propriétés publiques
  tracks: track[] = [];
  private previousVolume = 1;

  // Observables publics
  currentTrack = this.currentTrack$.asObservable();
  isPlaying = this.isPlaying$.asObservable();
  duration = this.duration$.asObservable();
  currentTime = this.currentTime$.asObservable();
  volume = this.volume$.asObservable();
  isMuted = this.isMuted$.asObservable();
  playlist = this.playlist$.asObservable();
  currentIndex = this.currentIndex$.asObservable();

  constructor() {
    this.setupAudioEvents();
  }

  private setupAudioEvents() {
    this.audio.onplay = () => this.isPlaying$.next(true);
    this.audio.onpause = () => this.isPlaying$.next(false);
    this.audio.ontimeupdate = () => {
      this.currentTime$.next(this.audio.currentTime);
      this.duration$.next(this.audio.duration || 0);
    };
    this.audio.onended = () => {
      this.isPlaying$.next(false);
      this.playNext();
    };
    this.audio.onvolumechange = () => {
      this.volume$.next(this.audio.volume);
      this.isMuted$.next(this.audio.muted);
    };
  }

  init() {
    this.loadTracks();
    // Initialisation du volume
    this.audio.volume = this.volume$.value;
  }

  loadTracks() {
    this.api.getSongs().subscribe({
      next: (tracks: track[]) => {
        this.tracks = tracks;
        if (this.tracks.length > 0) {
          this.currentIndex$.next(0);
          this.playCurrent();
        }
      },
      error: err => console.error(err)
    });
  }

  loadPlaylist(playlist: Playlist) {
    const tracks = playlist.songs.map(s => s.song);
    this.playlist$.next(tracks);
    this.currentIndex$.next(0);
    if (tracks.length > 0) {
      this.play(tracks[0]);
    }
  }
  setCurrentTrackIndex(index: number) {
    if (index >= 0 && index < this.tracks.length) {
      this.currentIndex$.next(index);
      this.currentIndex = this.currentIndex$.asObservable(); // si nécessaire
    }
  }
  play(track: Partial<track>) {

    const src = this.apiUrl + track.filePath

    if (this.audio.src !== src) {
      this.audio.src = src || "";
    }
    console.log('Playing track:', track);
    this.audio.play().catch((err) => console.error('Erreur lecture audio:', err));

    // Mise à jour du track actuel avec les bonnes URLs
    const updatedTrack = {
      ...track,
      thumbnail: track.thumbnail ? this.apiUrl + track.thumbnail : undefined
    };

    this.currentTrack$.next(updatedTrack);

    console.log(this.currentTrack$.value);
  }

  playCurrent() {
    const track = this.tracks[this.currentIndex$.value];
    if (track) this.play(track);
  }

  playNext() {
    const currentPlaylist = this.playlist$.value;
    const currentIdx = this.currentIndex$.value;

    if (currentPlaylist.length > 0) {
      const nextIndex = currentIdx + 1;
      if (nextIndex < currentPlaylist.length) {
        this.currentIndex$.next(nextIndex);
        this.play(currentPlaylist[nextIndex]);
        return;
      }
    }

    // Fallback vers la logique originale
    if (this.currentIndex$.value < this.tracks.length - 1) {
      const newIndex = this.currentIndex$.value + 1;
      this.currentIndex$.next(newIndex);
      this.playCurrent();
    } else {
      this.stop();
    }
  }

  playPrevious() {
    const currentPlaylist = this.playlist$.value;
    const currentIdx = this.currentIndex$.value;

    if (currentPlaylist.length > 0) {
      const prevIndex = currentIdx - 1;
      if (prevIndex >= 0) {
        this.currentIndex$.next(prevIndex);
        this.play(currentPlaylist[prevIndex]);
        return;
      }
    }

    // Fallback vers la logique originale
    if (this.currentIndex$.value > 0) {
      const newIndex = this.currentIndex$.value - 1;
      this.currentIndex$.next(newIndex);
      this.playCurrent();
    }
  }

  nextTrack() {
    this.playNext();
  }

  previousTrack() {
    this.playPrevious();
  }

  togglePlay() {
    if (this.isPlaying$.value) {
      this.pause();
    } else {
      const currentPlaylist = this.playlist$.value;
      const currentIdx = this.currentIndex$.value;
      const currentTrackData = this.currentTrack$.value;

      if (currentPlaylist.length > 0 && currentIdx >= 0) {
        this.play(currentPlaylist[currentIdx]);
      } else if (currentTrackData?.src) {
        const track: track = {
          src: currentTrackData.src,
          title: currentTrackData.title || 'Unknown Title',
          artist: currentTrackData.artist || 'Unknown Artist',
          thumbnail: currentTrackData.thumbnail || '',
          youtubeUrl: currentTrackData.youtubeUrl || '',
          filePath: currentTrackData.filePath || '',
          id: currentTrackData.id || '',
          duration: this.duration$.value,
          views: 0,
          description: '',
          createdAt: new Date()
        };
        this.play(track);
      }
    }
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentTrack$.next(null);
    this.isPlaying$.next(false);
  }

  seek(time: number) {
    this.audio.currentTime = time;
  }

  setVolume(volume: number) {
    this.audio.volume = volume;
    this.volume$.next(volume);

    if (volume > 0 && this.isMuted$.value) {
      this.audio.muted = false;
      this.isMuted$.next(false);
    }
  }

  toggleMute() {
    if (this.isMuted$.value) {
      this.audio.muted = false;
      this.audio.volume = this.previousVolume;
      this.volume$.next(this.previousVolume);
    } else {
      this.previousVolume = this.volume$.value;
      this.audio.muted = true;
      this.volume$.next(0);
    }
    this.isMuted$.next(!this.isMuted$.value);
  }

  skipForward(seconds: number = 15) {
    const newTime = Math.min(this.audio.currentTime + seconds, this.duration$.value);
    this.audio.currentTime = newTime;
  }

  skipBackward(seconds: number = 15) {
    const newTime = Math.max(this.audio.currentTime - seconds, 0);
    this.audio.currentTime = newTime;
  }

  // Méthodes utilitaires
  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  displayedTitle(maxLength: number = 25): string {
    const currentTrackData = this.currentTrack$.value;
    const title = currentTrackData?.title || 'Unknown Title';
    return title.length > maxLength ? title.slice(0, maxLength) + '…' : title;
  }

  displayedArtist(maxLength: number = 25): string {
    const currentTrackData = this.currentTrack$.value;
    const artist = currentTrackData?.artist || 'Unknown Artist';
    return artist.length > maxLength ? artist.slice(0, maxLength) + '…' : artist;
  }

  getTrackName(maxLength: number = 25): string {
    const currentTrackData = this.currentTrack$.value;
    if (!currentTrackData?.src) return '';
    const name = currentTrackData.title || 'Unknown Title';
    return name.length > maxLength ? name.slice(0, maxLength) + '…' : name;
  }

  // Getters pour les valeurs actuelles
  getCurrentTrack() {
    return this.currentTrack$.value;
  }

  getIsPlaying() {
    return this.isPlaying$.value;
  }

  getDuration() {
    return this.duration$.value;
  }

  getCurrentTime() {
    return this.currentTime$.value;
  }

  getVolume() {
    return this.volume$.value;
  }

  getIsMuted() {
    return this.isMuted$.value;
  }

  getPlaylist() {
    return this.playlist$.value;
  }

  getCurrentIndex() {
    return this.currentIndex$.value;
  }

  getAudioInstance() {
    return this.audio;
  }
}
