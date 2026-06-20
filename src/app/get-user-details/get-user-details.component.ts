import { Component, ViewChild } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HeaderComponentComponent } from '../header-component/header-component.component';
import { BillingComponent } from '../billing/billing.component';
import { addIcons } from 'ionicons';
import { library, playCircle, radio, search, cashOutline, pricetags, personAdd, wallet } from 'ionicons/icons';
import { QuotePriceComponent } from '../quote-price/quote-price.component';
import { ListProductComponent } from '../list-product/list-product.component';
import { CommonModule } from '@angular/common';
import { CreateUserComponent } from '../create-user/create-user.component';

@Component({
  selector: 'app-get-user-details',
  templateUrl: './get-user-details.component.html',
  styleUrls: ['./get-user-details.component.scss'],
  imports: [IonContent, IonHeader, IonIcon, IonTab, IonTabBar, IonTabButton, IonTabs, IonToolbar, HeaderComponentComponent, BillingComponent, QuotePriceComponent, ListProductComponent, CommonModule, CreateUserComponent],
})
export class GetUserDetailsComponent {

  @ViewChild(ListProductComponent) listProductComponent!: ListProductComponent;

  constructor() {
    addIcons({ library, playCircle, radio, search, cashOutline, pricetags, personAdd, wallet });
  }

  ngOnInit() { }

  onTabChange(event: any) {
    if (event.tab === 'library') {
      if (this.listProductComponent) {
        this.listProductComponent.GetProductList();
      }
    }
  }

}
