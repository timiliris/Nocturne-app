import { HttpClient } from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import {track} from "../../types/track.interface";
import {environment} from "../../../environments/environment";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

export interface Playlist {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  songs: { song: track }[]; // car relation via PlaylistSong
}

@Injectable({
  providedIn: 'root'
})



export class PlaylistService {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private router = inject(Router)


  private apiUrl = environment.apiUrl + '/api/playlists';
  form: FormGroup;
  public playlists : Playlist[] = [];

  isAddPlaylist: boolean = false
  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      color: ['#3880ff', Validators.required], // valeur hex par défaut
    });
  }

// Initialisation du service, chargement des playlists
  init(){
    this.getPlaylists().subscribe(playlists => {
      this.playlists = playlists;
      console.log('playlists loaded ',this.playlists);
    });
  }

  refreshPlaylist(){
    this.getPlaylists().subscribe(playlists => {
      this.playlists = playlists;
      console.log('playlists refreshed ',this.playlists);
    });
  }

// Fonction pour basculer l'état d'affichage du formulaire d'ajout de playlist
  toggleAddPlaylist(): void {
    this.isAddPlaylist = !this.isAddPlaylist;
    if (this.isAddPlaylist) {
      this.form.reset({ color: '#ffffff' }); // Réinitialise le formulaire avec la couleur par défaut
    }
  }
  // Fonction pour ajouter une playlist
  addPlaylist(): void {
    if (this.form.invalid) return;
    const { name, color } = this.form.value;

    this.createPlaylist(name, [], color).subscribe({
      next: (playlist) => {
        this.playlists.unshift(playlist);
        this.form.reset({ color: 'primary' });
        this.refreshPlaylist();
      },
      error: (err) => {
        console.error('Erreur lors de la création de la playlist', err);
      }
    });
  }
  // Fonction pour naviguer vers une playlist
  goToPlaylist(id: string) {
    this.router.navigate(['/playlists', id]);
  }

  // Fonction pour supprimer une playlist
  public deletePlaylist(id: string): void {
    if (!confirm('Supprimer cette playlist ?')) return;

    this.deletePlaylistCall(id).subscribe({
      next: () => {
        this.playlists = this.playlists.filter(p => p.id !== id);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression', err);
      }
    });
  }

  refreshPlaylists() {
    this.getPlaylists().subscribe(playlists => {
      this.playlists = playlists;
      console.log('playlists refreshed ',this.playlists);
    });
  }


  getPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(this.apiUrl, {
      withCredentials: true // Important pour envoyer le cookie !
    });
  }

  getPlaylist(id: string): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.apiUrl}/${id}`, {
      withCredentials: true // Important pour envoyer le cookie !
    });
  }

  createPlaylist(name: string, songIds: string[], color: string): Observable<Playlist> {
    return this.http.post<Playlist>(this.apiUrl, { name, songIds, color } , {
      withCredentials: true // Important pour envoyer le cookie !
    });
  }
  addSongToPlaylist(playlistId: string, songId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${playlistId}/songs`, { songId }, {
      withCredentials: true // Important pour envoyer le cookie !
    });
  }
  deletePlaylistCall(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true // Important pour envoyer le cookie !
    });
  }
}
