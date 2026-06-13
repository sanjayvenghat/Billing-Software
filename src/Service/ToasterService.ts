import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  // Generic method for full control
  async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'primary', duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: 'top', // 'top', 'middle', or 'bottom'
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  // Quick helper for Success
  async showSuccess(message: string) {
    await this.showToast(message, 'success', 2000);
  }

  // Quick helper for Errors
  async showError(message: string) {
    await this.showToast(message, 'danger', 3000); // Errors usually stay on screen a bit longer
  }



  // Quick helper for Warning
  async showWarning(message: string) {
    await this.showToast(message, 'warning', 2000);
  }
}