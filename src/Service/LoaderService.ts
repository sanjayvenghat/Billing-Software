import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private activeLoader: HTMLIonLoadingElement | null = null;

  constructor(private loadingController: LoadingController) { }

  /**
   * Shows a loading overlay with customized message and styling
   * @param message Message to display on the loader
   */
  async showLoader(message: string = 'Loading...') {
    if (this.activeLoader) {
      return;
    }

    this.activeLoader = await this.loadingController.create({
      message,
      cssClass: 'custom-loading',
    });

    await this.activeLoader.present();
  }
  async hideLoader() {
    if (this.activeLoader) {
      await this.activeLoader.dismiss();
      this.activeLoader = null;
    }
  }
}
