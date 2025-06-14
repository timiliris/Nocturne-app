import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {Observable} from 'rxjs';
import {track} from "../types/track.interface";




@Injectable({
  providedIn: 'root'
})
export class ApiService {

  http = inject(HttpClient);
  baseUrl: string = environment.apiUrl + '/api';

  constructor() { }

  getSongs(): Observable<track[]> {
    return this.http.get<track[]>(this.baseUrl + '/library', {
      withCredentials: true // Important pour envoyer le cookie !
    });
  }

  // GET a single song
  getSong(id: string): Observable<track> {
    return this.http.get<track>(`${this.baseUrl}/library/${id}`, {
      withCredentials: true // Important pour envoyer le cookie !
    });
  }

  // POST create new song
  createSong(song: Partial<track>): Observable<track> {
    return this.http.post<track>(this.baseUrl, song, {
      withCredentials: true // Important pour envoyer le cookie !
    });
  }

  // PUT update a song
  updateSong(id: string, song: Partial<track>): Observable<track> {
    return this.http.put<track>(`${this.baseUrl}/library/${id}`, song, {
      withCredentials: true // Important pour envoyer le cookie !
    });
  }

  // DELETE a song
  deleteSong(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/library/${id}`, {
      withCredentials: true // Important pour envoyer le cookie !
    });
  }
}
