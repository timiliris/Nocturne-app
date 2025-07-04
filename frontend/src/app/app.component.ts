
import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonRouterOutlet,
  IonRouterLink,
  IonCardTitle, IonBadge, IonChip
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import * as allIcons from "ionicons/icons";
import {AudioPlayerComponent} from "./components/audio-player/audio-player.component";
import {AudioPlayerService} from "./services/audio-player/audio-player.service";
import {PlaylistInMenuComponent} from "./components/playlist/playlist-in-menu/playlist-in-menu.component";
import {PlaylistService} from "./services/playlist/playlist.service";
import {LibraryService} from "./services/library/library.service";
import {AuthService} from "./services/auth/auth.service";
import {AsyncPipe} from "@angular/common";
import {MeiliService} from "./services/meili/meili.service";
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonMenuToggle, IonItem, IonIcon, IonRouterLink, IonRouterOutlet, AudioPlayerComponent, PlaylistInMenuComponent, IonCardTitle, IonBadge, IonChip, AsyncPipe],
})
export class AppComponent  implements OnInit {
  audioPlayer = inject(AudioPlayerService);
  playlistService = inject(PlaylistService);
  libraryService = inject(LibraryService);
  authService = inject(AuthService);
  meiliService = inject(MeiliService);
  router = inject(Router);
  public appPages = [
    { title: 'Library', url: '/home', icon: 'play' },
    { title: 'Playlists', url: '/playlists/all', icon: 'list' },
    { title: 'Download', url: '/download', icon: 'download' },
    { title: 'Settings', url: '/settings', icon: 'cog' },
  ];
  constructor() {
    addIcons(allIcons)
  }


  appInit(){
    this.libraryService.init();
    this.audioPlayer.init();
    this.playlistService.init();
    this.meiliService.searchSongs('', 20).then(songs => {
      console.log(songs);
    })
  }



  onLogout() {
    this.authService.logout().subscribe({
      next: (res) => {
        console.log("Déconnexion réussie :", res);
        this.router.navigate(['/auth']).then();
      },
      error: err => {
        console.error("Erreur de connexion", err);
      }
    });

  }


  ngOnInit() {
    // Vérifier la session au démarrage de l'application
    this.authService.checkSession().subscribe({
      next: (res) => {
        console.log('Session active:', res);
        if( res.authenticated) {
          this.appInit();
        }
        else{
          console.log('Aucune session active, redirection vers la page de connexion');
          this.router.navigate(['/auth']).then();
        }
      },
      error: (error) => {
        console.log('Pas de session active', error);

      }
    });
  }
}
