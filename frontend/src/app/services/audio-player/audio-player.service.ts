import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { track } from '../../types/track.interface';
import { environment } from '../../../environments/environment';
import {Playlist} from "../../types/playlist.interface";

@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  private api = inject(ApiService);
  private apiUrl = environment.apiUrl;
  private audio = new Audio();

  // Subjects (état interne)
  private currentTrack$ = new BehaviorSubject<Partial<track> | null>(null);
  private isPlaying$ = new BehaviorSubject<boolean>(false);
  private duration$ = new BehaviorSubject<number>(0);
  private currentTime$ = new BehaviorSubject<number>(0);
  private volume$ = new BehaviorSubject<number>(1);
  private isMuted$ = new BehaviorSubject<boolean>(false);
  private playlist$ = new BehaviorSubject<track[]>([]);
  private currentIndex$ = new BehaviorSubject<number>(-1);

  private previousVolume = 1;

  // Observables exposés
  currentTrack = this.currentTrack$.asObservable();
  isPlaying = this.isPlaying$.asObservable();
  duration = this.duration$.asObservable();
  currentTime = this.currentTime$.asObservable();
  volume = this.volume$.asObservable();
  isMuted = this.isMuted$.asObservable();
  playlist = this.playlist$.asObservable();
  currentIndex = this.currentIndex$.asObservable();

  tracks: track[] = [];

  constructor() {
    this.setupAudioEvents();
  }

  private setupAudioEvents() {
    this.audio.onplay = () => this.isPlaying$.next(true);
    this.audio.onpause = () => this.isPlaying$.next(false);
    this.audio.ontimeupdate = () => {
      this.currentTime$.next(this.audio.currentTime);
      this.duration$.next(this.audio.duration || 0);

      if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
        navigator.mediaSession.setPositionState({
          duration: this.audio.duration,
          playbackRate: this.audio.playbackRate,
          position: this.audio.currentTime,
        });
      }
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
    this.audio.volume = this.volume$.value;
  }

  loadTracks() {
    this.api.getSongs().subscribe({
      next: (tracks: track[]) => {
        this.tracks = tracks;
        if (tracks.length > 0) {
          this.currentIndex$.next(0);
          this.playCurrent();
        }
      },
      error: err => console.error('Erreur chargement des morceaux :', err)
    });
  }

  loadPlaylist(playlist: Playlist | null) {
    if(playlist) {
      const tracks = playlist.songs.map(s => s.song);
      this.playlist$.next(tracks);
      this.currentIndex$.next(0);
      if (tracks.length > 0) {
        this.play(tracks[0]);
      }
    }

  }

  setCurrentTrackIndex(index: number) {
    if (index >= 0 && index < this.tracks.length) {
      this.currentIndex$.next(index);
    }
  }

  play(track: Partial<track>) {
    if (!track || !track.filePath) return;

    const src = this.apiUrl + track.filePath;
    if (this.audio.src !== src) {
      this.audio.src = src;
    }

    const updatedTrack: Partial<track> = {
      ...track,
      thumbnail: track.thumbnail ? this.apiUrl + track.thumbnail : undefined,
    };

    this.currentTrack$.next(updatedTrack);
    this.setupMediaSession(updatedTrack);
    this.audio.play().catch(err => console.error('Erreur de lecture audio :', err));
  }

  playCurrent() {
    const currentPlaylist = this.playlist$.value;
    const index = this.currentIndex$.value;

    if (currentPlaylist.length > 0) {
      this.play(currentPlaylist[index]);
    } else if (this.tracks.length > 0 && index >= 0) {
      this.play(this.tracks[index]);
    }
  }

  playNext() {
    const currentPlaylist = this.playlist$.value;
    const currentIndex = this.currentIndex$.value;

    const list = currentPlaylist.length > 0 ? currentPlaylist : this.tracks;
    const nextIndex = currentIndex + 1;

    if (nextIndex < list.length) {
      this.currentIndex$.next(nextIndex);
      this.play(list[nextIndex]);
    } else {
      this.stop(); // fin de playlist
    }
  }

  playPrevious() {
    const currentPlaylist = this.playlist$.value;
    const currentIndex = this.currentIndex$.value;

    const list = currentPlaylist.length > 0 ? currentPlaylist : this.tracks;
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      this.currentIndex$.next(prevIndex);
      this.play(list[prevIndex]);
    }
  }

  togglePlay() {
    if (this.isPlaying$.value) {
      this.pause();
    } else {
      this.playCurrent();
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

  seek(seconds: number) {
    this.audio.currentTime = Math.max(0, Math.min(seconds, this.duration$.value));
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
      this.previousVolume = this.audio.volume;
      this.audio.muted = true;
      this.volume$.next(0);
    }
    this.isMuted$.next(!this.isMuted$.value);
  }
  private setupMediaSession(track: Partial<track>) {
    if (!('mediaSession' in navigator)) return;

    let artworkSrc;

    if (track.thumbnail) {
      try {
        // Essaie de créer une URL absolue à partir de track.thumbnail
        artworkSrc = new URL(track.thumbnail, this.apiUrl).href;
      } catch {
        // En cas d'erreur, fallback à concaténation simple
        artworkSrc = this.apiUrl + track.thumbnail;
      }
    } else {
      artworkSrc = 'assets/default-artwork.png';
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Unknown Title',
      artist: track.artist || 'Unknown Artist',
      album: 'Your App Name',
      artwork: [
        {
          src: artworkSrc,
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => this.playCurrent());
    navigator.mediaSession.setActionHandler('pause', () => this.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.playPrevious());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.playNext());
    navigator.mediaSession.setActionHandler('seekbackward', () => this.skipBackward(10));
    navigator.mediaSession.setActionHandler('seekforward', () => this.skipForward(10));
    navigator.mediaSession.setActionHandler('stop', () => this.stop());
  }

  skipForward(seconds: number = 15) {
    this.seek(this.audio.currentTime + seconds);
  }

  skipBackward(seconds: number = 15) {
    this.seek(this.audio.currentTime - seconds);
  }

  // Helpers pour affichage
  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  displayedTitle(maxLength = 25): string {
    const title = this.currentTrack$.value?.title || 'Unknown Title';
    return title.length > maxLength ? title.slice(0, maxLength) + '…' : title;
  }

  displayedArtist(maxLength = 25): string {
    const artist = this.currentTrack$.value?.artist || 'Unknown Artist';
    return artist.length > maxLength ? artist.slice(0, maxLength) + '…' : artist;
  }

  getTrackName(maxLength = 25): string {
    const name = this.currentTrack$.value?.title || 'Unknown Title';
    return name.length > maxLength ? name.slice(0, maxLength) + '…' : name;
  }
  getIMGUrl(filePath: string): string {
    const apiBaseUrl = environment.apiUrl;
    return apiBaseUrl + filePath;
  }
  // Getters internes
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
