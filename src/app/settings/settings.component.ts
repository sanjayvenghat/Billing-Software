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
  trendingUp,
  colorPalette,
  flash,
  checkmark,
  cube
} from 'ionicons/icons';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { ToastService } from 'src/Service/ToasterService';
import { LoaderService } from 'src/Service/LoaderService';
import { SettingService } from './setting-service';
import { TranslateService } from '../../Service/TranslateService';
import { TranslatePipe } from '../../Service/TranslatePipe';

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
    IonSelectOption,
    TranslatePipe
  ]
})
export class SettingsComponent implements OnInit {
  searchQuery: string = '';

  // Settings states
  gstBilling: boolean = false;
  showProfitOfEveryProduct: boolean = true;
  IconType: string = 'Standard Black';
  autoSync: boolean = false;
  systemLanguage: string = 'English';
  iconsList = [
    {
      Icontype: 'FirstIcon',
      url: 'assets/icon/store.png'
    },
    {
      Icontype: 'SecondIcon',
      url: 'assets/icon/store (2).png'
    },
    {
      Icontype: 'ThirdIcon',
      url: 'assets/icon/store (3).png'
    },
    {
      Icontype: 'DefaultIcon',
      url: 'assets/icon/default.png'
    }
  ];

  getSelectedIconUrl(): string {
    const selected = this.iconsList.find(item => item.Icontype === this.IconType);
    return selected ? selected.url : 'assets/icon/store.png';
  }

  constructor(
    private router: Router,
    private keysStorage: KEYSSTORAGE,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private SettingService: SettingService,
    private translateService: TranslateService
  ) {
    addIcons({
      'help-circle': helpCircle,
      'log-out': logOut,
      search,
      'chevron-forward': chevronForward,
      'refresh-circle': refreshCircle,
      globe,
      'arrow-undo': arrowUndo,
      'trending-up': trendingUp,
      'color-palette': colorPalette,
      flash,
      checkmark,
      cube
    });
  }



  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    let saved = this.keysStorage.getItem('APP_SETTINGS')
    if (saved) {
      this.gstBilling = saved.gstBilling ?? false;
      this.showProfitOfEveryProduct = saved.showProfitOfEveryProduct ?? true;
      this.IconType = saved.IconType;
      this.autoSync = saved.autoSync ?? false;
      this.systemLanguage = saved.systemLanguage ?? 'English';
    }
  }

  saveSettings() {
    const settingsObj = {
      darkMode: false,
      gstBilling: this.gstBilling,
      showProfitOfEveryProduct: this.showProfitOfEveryProduct,
      IconType: this.IconType,
      systemLanguage: this.systemLanguage
    };
    this.loaderService.showLoader();
    this.SettingService.UpdateSetting(settingsObj).subscribe({
      next: (val: any) => {
        this.loaderService.hideLoader();
        let messages = [
          "User Setting Updated Successfully",
          "Error in creating the user setting Please Contact The Admin",
          "User Setting Created Successfully",
          "Error in updating the user setting Please Contact The Admin"
        ];
        if (messages.includes(val?.message)) {
          this.keysStorage.setItem('IconType', this.IconType);
          this.keysStorage.setItem('APP_SETTINGS', settingsObj);
          this.translateService.setLanguage(this.systemLanguage);
          this.toastService.showSuccess(this.translateService.translate('Settings saved successfully!'));
        } else {
          this.toastService.showError(this.translateService.translate(val?.message || 'Failed to save settings.'));
        }
      },
      error: (err: any) => {
        this.loaderService.hideLoader();
        this.toastService.showError(this.translateService.translate(err?.error?.message || 'Failed to save settings.'));
      }
    })
  }

  resetToDefaults() {
    this.gstBilling = false;
    this.showProfitOfEveryProduct = true;
    this.IconType = 'Standard Black';
    this.systemLanguage = 'English';
    this.translateService.setLanguage('English');
    console.log('Settings reset to defaults');
    this.saveSettings();
  }

  backupData() {
    console.log('Backing up data...');
    this.toastService.showSuccess('Data backup initiated successfully!');
  }

  signOut() {
    this.keysStorage.clear();
    document.documentElement.classList.remove('ion-palette-dark');
    document.documentElement.classList.remove('dark');
    this.router.navigate(['/home']);
  }

  goBackToApp() {
    this.router.navigate(['/GetUserDetails']);
  }
}
