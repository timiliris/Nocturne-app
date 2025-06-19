import {Component, inject, Input, ViewChild, OnChanges, SimpleChanges} from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  ModalController
} from "@ionic/angular/standalone";
import {track} from "../../types/track.interface";
import {ApiService} from "../../services/api.service";
import {LibraryService} from "../../services/library/library.service";
import {AudioPlayerService} from "../../services/audio-player/audio-player.service";
import {OverlayEventDetail} from "@ionic/core/components";
import {FormsModule} from "@angular/forms";
import {AddInPlaylistComponent} from "../playlist/add-in-playlist/add-in-playlist.component";
import {NgForOf, NgIf} from "@angular/common";
import {SpeakerAnimComponent} from "../speaker-anim/speaker-anim.component";

@Component({
  selector: 'app-tracks-display',
  imports: [
    IonIcon,
    IonImg,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonText,
    IonThumbnail,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
    IonList,
    FormsModule,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    NgForOf,
    NgIf,
    SpeakerAnimComponent,
  ],
  templateUrl: './tracks-display.component.html',
  standalone: true,
  styleUrl: './tracks-display.component.css'
})
export class TracksDisplayComponent implements OnChanges {

  private api = inject(ApiService);
  private library = inject(LibraryService);
  protected audioService = inject(AudioPlayerService);
  private modalController = inject(ModalController);

  isModalOpen = false;
  selectedSong: track | null = null;
  selectedPlaylistId: string | null = null;
  currentSong: track | null = null;

  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  @Input() tracks: track[] = [];

  // Pagination pour infinite scroll côté client
  displayedTracks: track[] = [];
  pageSize = 10;
  currentPage = 0;
  allLoaded = false;

  // Mise à jour si la liste tracks change
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tracks']) {
      this.resetPagination();
    }
  }

  resetPagination() {
    this.currentPage = 0;
    this.allLoaded = false;
    this.displayedTracks = [];
    this.loadMore();
  }

  loadMore(event?: any) {
    if (this.allLoaded) {
      if (event) event.target.complete();
      return;
    }

    const nextItems = this.tracks.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
    this.displayedTracks = [...this.displayedTracks, ...nextItems];
    this.currentPage++;

    if (this.displayedTracks.length >= this.tracks.length) {
      this.allLoaded = true;
    }

    if (event) {
      event.target.complete();
    }
  }

  trackById(index: number, item: track) {
    return item.id;
  }

  async openPlaylistManagerModal(){
    const modal = await this.modalController.create({
      component: AddInPlaylistComponent,
      componentProps: {
        songId: this.selectedSong ? this.selectedSong.id : null,
      },
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.25, 0.5, 0.75],
      handleBehavior: "cycle"
    });
    await modal.present();
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {

    }
    this.isModalOpen = false;
  }

  async cancel() {
    await this.modal.dismiss(null, 'cancel');
  }

  async confirm() {
    await this.modal.dismiss('confirm');
  }

  playTrack(track: track): void {
    this.audioService.play(track);
  }

  onDeleteSong(): void {
    if(this.selectedSong) {
      console.log("selectedSong", this.selectedSong);
      this.deleteSong(this.selectedSong.id);
      this.isModalOpen = false; // Ferme le modal après la suppression
    }
  }

  deleteSong(id: string): void {
    this.api.deleteSong(id).subscribe({
      next: data => {
        console.log('Song deleted successfully', data);
        this.library.loadLibrary();
      },
      error: err => console.error('Error deleting song', err),
    });
  }

  async openPlaylistModal(song: track) {
    this.selectedSong = song;
    this.selectedPlaylistId = null;
    this.isModalOpen = true;
  }
}
