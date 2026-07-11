import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonToggle,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  helpCircle,
  logOut,
  search,
  chevronForward,
  refreshCircle,
  globe,
  arrowUndo,
  moon,
  trendingUp,
  colorPalette,
  flash,
  checkmark
} from 'ionicons/icons';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { ToastService } from 'src/Service/ToasterService';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonToggle,
    IonSelect,
    IonSelectOption
  ]
})
export class SettingsComponent implements OnInit {
  searchQuery: string = '';

  // Settings states
  darkMode: boolean = false;
  gstBilling: boolean = false;
  showProfitOfEveryProduct: boolean = true;
  enableTactileFeedback: boolean = true;
  colorAccent: string = 'Standard Black';
  autoSync: boolean = false;
  systemLanguage: string = 'English';

  constructor(
    private router: Router,
    private keysStorage: KEYSSTORAGE,
    private toastService: ToastService
  ) {
    addIcons({
      'help-circle': helpCircle,
      'log-out': logOut,
      search,
      'chevron-forward': chevronForward,
      'refresh-circle': refreshCircle,
      globe,
      'arrow-undo': arrowUndo,
      moon,
      'trending-up': trendingUp,
      'color-palette': colorPalette,
      flash,
      checkmark
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    const saved = this.keysStorage.getItem('APP_SETTINGS');
    if (saved) {
      this.darkMode = saved.darkMode ?? false;
      this.gstBilling = saved.gstBilling ?? false;
      this.showProfitOfEveryProduct = saved.showProfitOfEveryProduct ?? true;
      this.enableTactileFeedback = saved.enableTactileFeedback ?? true;
      this.colorAccent = saved.colorAccent ?? 'Standard Black';
      this.autoSync = saved.autoSync ?? false;
      this.systemLanguage = saved.systemLanguage ?? 'English';
    }
  }

  saveSettings() {
    const settingsObj = {
      darkMode: this.darkMode,
      gstBilling: this.gstBilling,
      showProfitOfEveryProduct: this.showProfitOfEveryProduct,
      enableTactileFeedback: this.enableTactileFeedback,
      colorAccent: this.colorAccent,
      autoSync: this.autoSync,
      systemLanguage: this.systemLanguage
    };
    this.keysStorage.setItem('APP_SETTINGS', settingsObj);
    this.toastService.showSuccess('Settings saved successfully!');
  }

  resetToDefaults() {
    this.darkMode = false;
    this.gstBilling = false;
    this.showProfitOfEveryProduct = true;
    this.enableTactileFeedback = true;
    this.colorAccent = 'Standard Black';
    this.autoSync = false;
    this.systemLanguage = 'English';
    console.log('Settings reset to defaults');
    this.toastService.showToast('Settings reset to default values.', 'warning');
  }

  backupData() {
    console.log('Backing up data...');
    this.toastService.showSuccess('Data backup initiated successfully!');
  }

  signOut() {
    this.keysStorage.clear();
    this.router.navigate(['/home']);
  }

  goBackToApp() {
    this.router.navigate(['/GetUserDetails']);
  }
}
