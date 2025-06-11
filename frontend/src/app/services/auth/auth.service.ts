// src/app/services/auth.service.ts
import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import {environment} from "../../../environments/environment.prod";
import {Router} from "@angular/router";
import * as process from "node:process";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router)
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this._isAuthenticated.asObservable();
  apiUrl = environment.apiUrl || (window as any).ENV.API_URL;

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
        this.router.navigate(['/auth']).then()
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
