// src/app/services/auth.service.ts
import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import {environment} from "../../../environments/environment";
import {Router} from "@angular/router";
import {AudioPlayerService} from "../audio-player/audio-player.service";
import {MenuController} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router)
  private menuController = inject(MenuController);
  private audioPlayerService = inject(AudioPlayerService);
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this._isAuthenticated.asObservable();
  apiUrl = environment.apiUrl;

  constructor() {}

  login(username: string, password: string) {
    return this.http.post<{ message: string }>(this.apiUrl + '/auth', { username, password }, {
      withCredentials: true // Important pour envoyer le cookie !
    }).pipe(
      tap(() => {
        this._isAuthenticated.next(true);
      })
    );
  }


  logout() {
    return this.http.post(this.apiUrl +'/auth/logout', {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this._isAuthenticated.next(false);
        this.audioPlayerService.stop();
        this.router.navigate(['/auth']).then(res => {
          if(res){
            this.menuController.close('main-menu').then()
          }
          else {
            console.error('Erreur lors de la navigation vers /auth');
          }
        })
      })
    );
  }

  checkSession() {
    // Optionnel : ping une route qui vérifie si la session est toujours active
    return this.http.get<{ authenticated: boolean }>(this.apiUrl +'/auth/status', {
      withCredentials: true
    }).pipe(
      tap(res => this._isAuthenticated.next(res.authenticated))
    );
  }
}
