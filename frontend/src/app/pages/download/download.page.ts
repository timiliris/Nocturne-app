import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import {DownloadComponent} from "../../components/download/download.component";
import {HeaderComponent} from "../../components/header/header.component";

@Component({
  selector: 'app-download',
  templateUrl: './download.page.html',
  styleUrls: ['./download.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, DownloadComponent, HeaderComponent]
})
export class DownloadPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
