import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { SidebarComponent } from './sidebar/sidebar.component';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, SidebarComponent],
})
export class AppComponent implements OnInit {
  constructor(
    private keysStorage: KEYSSTORAGE,
    private router: Router
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      sessionStorage.setItem('currentRoute', event.urlAfterRedirects);
    });
  }

  ngOnInit() {
    document.documentElement.classList.remove('ion-palette-dark');
    document.documentElement.classList.remove('dark');
  }
}
