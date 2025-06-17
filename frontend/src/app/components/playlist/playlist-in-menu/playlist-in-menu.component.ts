import {Component, inject} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {PlaylistService } from '../../../services/playlist/playlist.service';
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
export class PlaylistInMenuComponent {
  router = inject(Router)
  isLoading = false;



  constructor(
    protected playlistService: PlaylistService,
  ) {}


// Convert hex color to rgba with alpha
  getRgbaColor(hexColor: string, alpha: number): string {
    let c = hexColor.replace('#', '');

    // Support #RGB format
    if (c.length === 3) {
      c = c.split('').map(ch => ch + ch).join('');
    }

    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }


// return a border style with the given hex color and alpha
  getBorderStyle(hexColor: string, alpha: number): string {
    return `1px solid ${this.getRgbaColor(hexColor, alpha)}`;
  }

}
