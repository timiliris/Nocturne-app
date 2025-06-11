import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import{IonContent} from '@ionic/angular/standalone';
import {LibraryComponent} from "../components/library/library.component";
import {HeaderComponent} from "../components/header/header.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    LibraryComponent,
    HeaderComponent
  ]
})
export class HomePage implements OnInit {

  songs = [
    {
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      cover: 'https://i.scdn.co/image/ab67616d0000b273f1c7cba3860f1cd14bfaed47'
    },
    {
      title: 'Levitating',
      artist: 'Dua Lipa',
      cover: 'https://i.scdn.co/image/ab67616d0000b2738a25b2f6a7adf07b6ab9c2d2'
    },
    {
      title: 'Save Your Tears',
      artist: 'The Weeknd',
      cover: 'https://i.scdn.co/image/ab67616d0000b273f87c0b6ed09a56cfa2a2e0d4'
    }
  ];

  constructor() { }

  ngOnInit() {}

  playSong(song: any) {
    console.log('Now playing:', song.title);
    // Add your audio player logic here
  }

}
