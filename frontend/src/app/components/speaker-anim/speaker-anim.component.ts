import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-speaker-anim',
  imports: [],
  standalone: true,
  templateUrl: './speaker-anim.component.html',
  styleUrl: './speaker-anim.component.css'
})
export class SpeakerAnimComponent {
@Input() animation: 'ripple' | 'wave' | 'orb' = 'wave';
}
