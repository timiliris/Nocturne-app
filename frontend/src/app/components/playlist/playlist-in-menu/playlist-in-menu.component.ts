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

}
