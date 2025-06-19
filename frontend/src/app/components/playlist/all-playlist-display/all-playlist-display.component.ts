import {Component, inject, OnInit} from '@angular/core';
import {Playlist} from "../../../types/playlist.interface";
import {MeiliService} from "../../../services/meili/meili.service";
import {
  IonBadge,
  IonChip,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel, IonList
} from "@ionic/angular/standalone";
import {PlaylistService} from "../../../services/playlist/playlist.service";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-all-playlist-display',
  imports: [
    IonBadge,
    IonChip,
    IonItem,
    IonLabel,
    NgForOf,
    NgIf,
    IonIcon,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonList
  ],
  templateUrl: './all-playlist-display.component.html',
  styleUrl: './all-playlist-display.component.css'
})
export class AllPlaylistDisplayComponent implements OnInit {

  private meiliService = inject(MeiliService);
  public playlistService = inject(PlaylistService);
  playlists: Playlist[] = [];
  isLoading = true;

  async ngOnInit() {
    await this.LoadAllPlaylists();
  }

 async LoadAllPlaylists() {
    try{
      this.playlists = await this.meiliService.getAllPlaylists();
      this.isLoading = false;
    }catch (error) {
      console.error('Error loading playlists:', error);
    }
  }

}
