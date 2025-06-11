import {Component, Input} from '@angular/core';
import {
  IonBackButton,
  IonButtons,
  IonCardSubtitle,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-header',
  imports: [
    IonToolbar,
    IonHeader,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonCardSubtitle,
    IonBackButton
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  @Input() title: string = 'Default Title';
  @Input() numberOfSongs?: number;
  @Input() showBackButton: boolean = false;

}
