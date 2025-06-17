import {AudioPlayerService} from "../../services/audio-player/audio-player.service";
import {track} from "../../types/track.interface";
import {Component, inject, OnInit} from "@angular/core";
import {ApiService} from "../../services/api.service";
import {IonSearchbar} from "@ionic/angular/standalone";
import {IonList, IonText} from "@ionic/angular/standalone";
import {NgIf} from "@angular/common";
import {LibraryService} from "../../services/library/library.service";
import {FormsModule} from "@angular/forms";
import {TracksDisplayComponent} from "../tracks-display/tracks-display.component";

@Component({
  selector: 'app-library',
  imports: [
    IonList,
    NgIf,
    IonText,
    IonSearchbar,
    FormsModule,
    TracksDisplayComponent,
  ],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css'] // <-- correction ici
})
export class LibraryComponent implements OnInit {

  api = inject(ApiService);
  library = inject(LibraryService);
  songs: track[] = [];
  filteredSongs: track[] = [];
  searchTerm: string = '';


  constructor(protected audioService: AudioPlayerService) {}

  ngOnInit() {
    this.loadLibrary();
  }

// Load the library of songs from the API
  loadLibrary() {
    this.api.getSongs().subscribe({
      next: data => {
        this.songs = data;
        this.filteredSongs = data;
        this.audioService.tracks = data;
      },
      error: err => console.error(err)
    });
  }

// Filter songs based on the search term
  filterSongs() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredSongs = this.songs;
    } else {
      this.filteredSongs = this.songs.filter(song =>
        song.title.toLowerCase().includes(term) ||
        song.artist.toLowerCase().includes(term)
      );
    }
  }
}
