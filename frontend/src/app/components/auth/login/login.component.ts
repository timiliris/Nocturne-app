import {Component, inject, OnInit} from '@angular/core';
import {IonButton, IonCardSubtitle, IonCol, IonGrid, IonInput, IonRow} from "@ionic/angular/standalone";
import {FormsModule} from "@angular/forms";
import { AuthService } from 'src/app/services/auth/auth.service';
import {AsyncPipe} from "@angular/common";
import {AudioPlayerService} from "../../../services/audio-player/audio-player.service";
import {PlaylistService} from "../../../services/playlist/playlist.service";
import {LibraryService} from "../../../services/library/library.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  imports: [
    IonInput,
    FormsModule,
    IonButton,
    IonCol,
    IonRow,
    IonGrid,
    AsyncPipe,
    IonCardSubtitle
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  AuthServices = inject(AuthService);
  audioPlayer = inject(AudioPlayerService);
  playlistService = inject(PlaylistService);
  libraryService = inject(LibraryService);
  router = inject(Router)
  username = '';
  password = '';
  SessionActive : boolean = false;
  SessionMessage: string = '';
  ngOnInit() {
    // Vérifier la session au démarrage du composant
    this.AuthServices.checkSession().subscribe({
      next: (res) => {
        this.SessionActive = res.authenticated;
        if(this.SessionActive) {
          this.SessionMessage = 'Session active detected';
          this.SessionActive = true;
        }
        else{
          this.SessionActive = false;
          this.SessionMessage = 'No active session detected';
        }

        console.log("Session active :", this.SessionActive);
      },
      error: err => {
        this.SessionActive = false;
        this.SessionMessage = 'No active session detected';
        console.error("Erreur lors de la vérification de la session", err);
      }
    });
  }

  onLogin() {
    this.AuthServices.login(this.username, this.password).subscribe({
      next: () => {
        console.log("Connexion réussie");
        this.libraryService.init();
        this.audioPlayer.init();
        this.playlistService.init();
        this.router.navigate(['/home']).then();
      },
      error: err => {
        console.error("Erreur de connexion", err);
      }
    });
  }

  onLogout() {
    this.AuthServices.logout().subscribe({
      next: (res) => {
        console.log("Déconnexion réussie :", res);
        // Rediriger ou mettre à jour l'état
      },
      error: err => {
        console.error("Erreur de connexion", err);
      }
    });

  }
}
