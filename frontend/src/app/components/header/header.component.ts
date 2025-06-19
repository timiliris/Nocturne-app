import {Component, Input} from '@angular/core';
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonMenuButton, IonText,
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
    IonBackButton,
    IonText
  ],
  templateUrl: './header.component.html',
  standalone: true,
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  @Input() title: string = 'Default Title';
  @Input() numberOfSongs!: number;
  @Input() showBackButton: boolean = false;

}
