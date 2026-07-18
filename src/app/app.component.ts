import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { SidebarComponent } from './sidebar/sidebar.component';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, SidebarComponent],
})
export class AppComponent implements OnInit {
  constructor(private keysStorage: KEYSSTORAGE) { }

  ngOnInit() {
    const saved = this.keysStorage.getItem('APP_SETTINGS');
    if (saved && saved.darkMode) {
      document.documentElement.classList.add('ion-palette-dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('ion-palette-dark');
      document.documentElement.classList.remove('dark');
    }
  }
}
