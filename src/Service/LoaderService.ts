import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private activeLoader: HTMLIonLoadingElement | null = null;
  private isLoading = false;

  constructor(private loadingController: LoadingController) { }

  /**
   * Shows a loading overlay with customized message and styling
   * @param message Message to display on the loader
   */
  async showLoader(message: string = 'Loading...') {
    if (this.isLoading || this.activeLoader) {
      return;
    }
    this.isLoading = true;

    try {
      this.activeLoader = await this.loadingController.create({
        message,
        cssClass: 'custom-loading',
      });
      await this.activeLoader.present();
    } catch (e) {
      this.isLoading = false;
      this.activeLoader = null;
    }
  }
  async hideLoader() {
    this.isLoading = false;
    if (this.activeLoader) {
      await this.activeLoader.dismiss();
      this.activeLoader = null;
    }
  }
}
