import {inject, Injectable} from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastCtrl = inject(ToastController);

  constructor() { }


  async successToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      icon: 'checkmark-circle',
      message: message,
      duration: 1500,
      position: "top",
      color: 'success'
    });

    await toast.present();
  }

  async errorToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      icon: 'close-circle',
      message: message,
      duration: 1500,
      position: "top",
      color: 'danger'
    });

    await toast.present();
  }


}
