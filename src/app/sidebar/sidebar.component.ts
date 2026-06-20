import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonIcon, IonList, IonMenuToggle, IonItem, IonLabel, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { basket, documentText, documents, trendingUp, statsChart, logOut, diamond } from 'ionicons/icons';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonIcon, IonList, IonMenuToggle, IonItem, IonLabel, IonButton
  ]
})
export class SidebarComponent implements OnInit {

  constructor() {
    addIcons({ basket, 'document-text': documentText, documents, 'trending-up': trendingUp, 'stats-chart': statsChart, 'log-out': logOut, diamond });
  }
  SideBarMenu = [
    {
      Title: 'Generate Pending Bills Report for A week',
      Url: '/get-user-details',
      Icon: 'document-text',
      ColorClass: 'week-bills-box'
    },
    {
      Title: 'Generate Pending Bills Report for A Month',
      Url: '/billing',
      Icon: 'documents',
      ColorClass: 'month-bills-box'
    },
    {
      Title: 'Get Profit Report for A week',
      Url: '/quote-price',
      Icon: 'trending-up',
      ColorClass: 'week-profit-box'
    },
    {
      Title: 'Get Profit Report for A Month',
      Url: '/quote-price',
      Icon: 'stats-chart',
      ColorClass: 'month-profit-box'
    },
    {
      Title: 'Log Out',
      Url: '/list-product',
      Icon: 'log-out',
      ColorClass: 'logout-box'
    },
  ];
  ngOnInit() { }

}
