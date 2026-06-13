import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  constructor() { }
  SideBarMenu = [
    {
      Title: 'Get Report On the expences',
      Url: '/get-user-details',
    },
    {
      Title: 'Billing',
      Url: '/billing',
    },
    {
      Title: 'Quote Price',
      Url: '/quote-price',
    },
    {
      Title: 'List Product',
      Url: '/list-product',
    },
  ]
  ngOnInit() { }

}
