import {Component, inject, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Playlist, PlaylistService } from '../../../services/playlist/playlist.service';
import { IonicModule } from '@ionic/angular';
import {NgForOf, NgIf} from "@angular/common";
import {Router} from "@angular/router";

@Component({
  selector: 'app-playlist-in-menu',
  templateUrl: './playlist-in-menu.component.html',
  styleUrls: ['./playlist-in-menu.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonicModule,
    NgForOf,
    NgIf
  ]
})
export class PlaylistInMenuComponent implements OnInit {
  router = inject(Router)
  isLoading = false;



  constructor(
    protected playlistService: PlaylistService,
  ) {

  }

  ngOnInit(): void {
  }
// Convertir hex en rgba avec alpha (opacité)
  getRgbaColor(hexColor: string, alpha: number): string {
    const c = hexColor.charAt(0) === '#' ? hexColor.substring(1) : hexColor;
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

// Retourne un style de bordure avec opacité et couleur
  getBorderStyle(hexColor: string, alpha: number): string {
    return `1px solid ${this.getRgbaColor(hexColor, alpha)}`;
  }

// Fonction pour texte lisible (noir ou blanc)
  getContrastedColor(hexColor: string): string {
    const c = hexColor.charAt(0) === '#' ? hexColor.substring(1) : hexColor;
    const r = parseInt(c.substr(0,2),16);
    const g = parseInt(c.substr(2,2),16);
    const b = parseInt(c.substr(4,2),16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }


}
