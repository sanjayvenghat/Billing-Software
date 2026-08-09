import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CreateUserComponent } from '../create-user/create-user.component';
import { IonTableComponent } from '../ion-table/ion-table.component';
import { TranslatePipe } from '../../Service/TranslatePipe';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-get-user-details',
  templateUrl: './get-user-details.component.html',
  styleUrls: ['./get-user-details.component.scss'],
  imports: [IonTableComponent, RouterLink, IonContent, IonHeader, IonIcon, IonTab, IonTabBar, IonTabButton, IonTabs, HeaderComponentComponent, BillingComponent, ListProductComponent, TranslatePipe],
})
export class GetUserDetailsComponent {

  @ViewChild(BillingComponent) billingComponent!: BillingComponent;
  @ViewChild(QuotePriceComponent) quotePriceComponent!: QuotePriceComponent;
  @ViewChild(CreateUserComponent) createUserComponent!: CreateUserComponent;
  @ViewChild(ListProductComponent) listProductComponent!: ListProductComponent;
  @ViewChild(IonTableComponent) ionTableComponent!: IonTableComponent;
  @ViewChild('myTabs') tabs!: any;

  isMobile = true;
  private desktopMedia?: MediaQueryList;

  constructor(private router: Router) {
    addIcons({ library, playCircle, radio, search, cashOutline, pricetags, personAdd, wallet });
  }

  ngOnInit() {
    this.desktopMedia = window.matchMedia('(min-width: 992px)');
    this.updateViewport();
    this.desktopMedia.addEventListener('change', this.updateViewport);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.syncTabWithRoute(event.urlAfterRedirects || event.url);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.syncTabWithRoute(this.router.url);
    }, 150);
  }

  private syncTabWithRoute(url: string) {
    console.log('syncTabWithRoute called with:', url, 'tabs availability:', !!this.tabs);
    if (!this.tabs) return;
    if (url.includes('/GetUserDetails/billing')) {
      this.tabs.select('home');
    } else if (url.includes('/GetUserDetails/product-list')) {
      this.tabs.select('library');
    } else if (url.includes('/GetUserDetails/pending')) {
      this.tabs.select('Accounts and pending');
    }
  }

  ngOnDestroy() {
    this.desktopMedia?.removeEventListener('change', this.updateViewport);
  }

  private updateViewport = () => {
    this.isMobile = !this.desktopMedia?.matches;
  };

  onTabChange(event: any) {
    if (event.tab === 'home') {
      if (this.billingComponent) {
        this.billingComponent.clearBillingState();
      }
    } else if (event.tab === 'radio') {
      if (this.quotePriceComponent) {
        this.quotePriceComponent.clearQuoteState();
      }
    } else if (event.tab === 'library') {
      if (this.listProductComponent) {
        this.listProductComponent.clearListState();
        this.listProductComponent.GetProductList();
      }
    } else if (event.tab === 'Accounts and pending') {
      if (this.ionTableComponent) {
        this.ionTableComponent.clearTableState();
        this.ionTableComponent.loadCustomers();
      }
    } else if (event.tab === 'Add User') {
      if (this.createUserComponent) {
        this.createUserComponent.clearCreateUserState();
      }
    }
  }
}
