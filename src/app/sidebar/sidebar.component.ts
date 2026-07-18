import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonIcon, IonList, IonMenuToggle, IonItem, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { basket, documentText, documents, trendingUp, statsChart, logOut, diamond, cart, speedometer } from 'ionicons/icons';
import { Router } from '@angular/router';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { settings } from 'ionicons/icons';
import { TranslatePipe } from '../../Service/TranslatePipe';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonIcon, IonList, IonMenuToggle, IonItem, IonLabel,
    TranslatePipe
  ]
})
export class SidebarComponent implements OnInit {

  constructor(private router: Router, private keysStorage: KEYSSTORAGE) {
    addIcons({ basket, 'document-text': documentText, documents, 'trending-up': trendingUp, 'stats-chart': statsChart, 'log-out': logOut, diamond, settings, cart, speedometer });
  }
  SideBarMenu = [
    {
      Title: 'Settings',
      Url: '/settings',
      Icon: 'settings',
      ColorClass: 'week-bills-box'
    },
    {
      Title: 'Go To Your E-Commerce Dashboard',
      Url: '/EcommerceDashboard',
      Icon: 'cart',
      ColorClass: 'month-bills-box'
    },
    {
      Title: 'Log Out',
      Url: '/home',
      Icon: 'log-out',
      ColorClass: 'logout-box'
    },
  ];
  ngOnInit() { }
  chooseOption(item: any) {
    if (item.Title == "Log Out") {
      this.keysStorage.clear();
      this.router.navigate(['/home']);
    } else {
      this.router.navigate([item.Url]);
    }
  }



}
