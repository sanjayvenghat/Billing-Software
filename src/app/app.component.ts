import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { SidebarComponent } from './sidebar/sidebar.component';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, SidebarComponent],
})
export class AppComponent {
  constructor() { }
}
