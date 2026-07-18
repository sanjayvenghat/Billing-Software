import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
  IonSearchbar,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  AlertController,
  IonInput,
  IonContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  searchOutline,
  personOutline,
  walletOutline,
  cashOutline,
  chevronDownOutline,
  chevronUpOutline,
  eyeOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  calendarOutline,
  callOutline,
  cartOutline,
  alertCircleOutline,
  receiptOutline,
  checkmarkOutline,
  shareSocialOutline
} from 'ionicons/icons';
import { Billingservice } from '../billing/billingservice';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { LoaderService } from 'src/Service/LoaderService';
import { ToastService } from 'src/Service/ToasterService';
import { TranslatePipe } from '../../Service/TranslatePipe';
import { TranslateService } from '../../Service/TranslateService';

@Component({
  selector: 'app-ion-table',
  templateUrl: './ion-table.component.html',
  styleUrls: ['./ion-table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonSearchbar,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonInput,
    IonContent,
    TranslatePipe
  ]
})
export class IonTableComponent implements OnInit {
  searchQuery: string = '';
  filterType: string = 'pending'; // 'pending' or 'all'
  customers: any[] = [];
  filteredCustomers: any[] = [];
  expandedCustomerId: string | null = null;
  isHeaderVisible: boolean = true;

  toggleHeader() {
    this.isHeaderVisible = !this.isHeaderVisible;
  }

  // No modal states needed for direct alert confirmations

  // Stats
  totalPendingDues: number = 0;
  activeDebtorsCount: number = 0;
  averageDueAmount: number = 0;

  constructor(
    private billingService: Billingservice,
    private keysStorage: KEYSSTORAGE,
    private loaderService: LoaderService,
    private toastService: ToastService,
    private alertController: AlertController,
    private translateService: TranslateService
  ) {
    addIcons({
      searchOutline,
      personOutline,
      walletOutline,
      cashOutline,
      'chevron-down-outline': chevronDownOutline,
      'chevron-up-outline': chevronUpOutline,
      eyeOutline,
      closeCircleOutline,
      checkmarkCircleOutline,
      calendarOutline,
      callOutline,
      cartOutline,
      alertCircleOutline,
      receiptOutline,
      checkmarkOutline,
      'share-social-outline': shareSocialOutline
    });
  }

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    const companyId = this.keysStorage.getItem('CompanyId');
    if (!companyId) {
      this.toastService.showError(this.translateService.translate('Company ID not found. Please log in.'));
      return;
    }
    this.loaderService.showLoader(this.translateService.translate('Loading pending accounts...'));

    // An empty searchValue gets all customers
    this.billingService.searchUsers({ searchValue: '', companyId }).subscribe({
      next: (response: any) => {
        this.customers = response.userdata || [];
        this.processCustomersData();
        this.applyFilter();
        this.loaderService.hideLoader();
      },
      error: (err: any) => {
        console.error('Error loading customers:', err);
        this.toastService.showError(this.translateService.translate('Failed to load customer accounts.'));
        this.loaderService.hideLoader();
      }
    });
  }

  processCustomersData() {
    this.customers = this.customers.map(c => {
      let totalDue = 0;
      let lastUpdated: any = null;

      if (c.CustomerList && Array.isArray(c.CustomerList)) {
        c.CustomerList.forEach((bill: any) => {
          totalDue += Number(bill.balanceAmount || 0);
          if (bill.date) {
            const billDate = new Date(bill.date);
            if (!lastUpdated || billDate.getTime() > lastUpdated.getTime()) {
              lastUpdated = billDate;
            }
          }
        });
      }

      return {
        ...c,
        totalDue: totalDue,
        inputPayAmount: totalDue,
        lastUpdatedFormatted: lastUpdated ? lastUpdated.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A',
        // Initialize an expanded state for each bill's items list
        billsExtended: (c.CustomerList || []).map((bill: any) => ({
          ...bill,
          inputPayAmount: bill.balanceAmount,
          showItems: false
        }))
      };
    });

    // Compute aggregates
    this.totalPendingDues = this.customers.reduce((acc, c) => acc + (c.totalDue || 0), 0);
    const debtors = this.customers.filter(c => c.totalDue > 0);
    this.activeDebtorsCount = debtors.length;
    this.averageDueAmount = this.activeDebtorsCount > 0 ? (this.totalPendingDues / this.activeDebtorsCount) : 0;
  }

  applyFilter() {
    let temp = this.customers;

    if (this.filterType === 'pending') {
      temp = temp.filter(c => c.totalDue > 0);
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      temp = temp.filter(c =>
        c.CustomerName.toLowerCase().includes(q) ||
        (c.MobileNumber && c.MobileNumber.toString().includes(q))
      );
    }

    this.filteredCustomers = temp;
  }

  toggleRow(customerId: string) {
    if (this.expandedCustomerId === customerId) {
      this.expandedCustomerId = null;
    } else {
      this.expandedCustomerId = customerId;
    }
  }

  toggleBillItems(bill: any) {
    bill.showItems = !bill.showItems;
  }

  async confirmMarkAsPaid(customer: any, bill: any) {
    const amount = Number(bill.inputPayAmount);
    if (isNaN(amount) || amount <= 0) {
      this.toastService.showWarning(this.translateService.translate('Please enter a valid payment amount.'));
      return;
    }
    if (amount > bill.balanceAmount) {
      this.toastService.showWarning(this.translateService.translate('Payment amount cannot exceed bill outstanding balance of') + ` ₹${bill.balanceAmount}.`);
      return;
    }

    const alert = await this.alertController.create({
      header: this.translateService.translate('Confirm Payment'),
      message: this.translateService.translate('Record payment of') + ` ₹${amount} ` + this.translateService.translate('for bill date') + ` ${bill.date ? (new Date(bill.date).toLocaleDateString()) : ''}?`,
      buttons: [
        {
          text: this.translateService.translate('Cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.translate('Yes'),
          handler: () => {
            this.executeMarkAsPaid(customer, bill, amount);
          }
        }
      ]
    });
    await alert.present();
  }

  executeMarkAsPaid(customer: any, bill: any, amount: number) {
    const payload = {
      customerId: customer._id,
      companyId: this.keysStorage.getItem('CompanyId'),
      billId: bill.billId || bill.date,
      payAmount: amount
    };

    this.loaderService.showLoader(this.translateService.translate('Processing payment...'));
    this.billingService.PayPendingBill(payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(this.translateService.translate('Payment recorded successfully!'));
        this.loadCustomers();
      },
      error: (err: any) => {
        console.error('Error recording payment:', err);
        this.toastService.showError(this.translateService.translate('Failed to record payment.'));
        this.loaderService.hideLoader();
      }
    });
  }

  async confirmCustomerGeneralPayment(customer: any) {
    const amount = Number(customer.inputPayAmount);
    if (isNaN(amount) || amount <= 0) {
      this.toastService.showWarning(this.translateService.translate('Please enter a valid payment amount.'));
      return;
    }
    if (amount > customer.totalDue) {
      this.toastService.showWarning(this.translateService.translate('Payment amount cannot exceed total outstanding dues of') + ` ₹${customer.totalDue}.`);
      return;
    }

    const alert = await this.alertController.create({
      header: this.translateService.translate('Confirm Payment'),
      message: this.translateService.translate('Record general payment of') + ` ₹${amount} ` + this.translateService.translate('for') + ` ${customer.CustomerName}?`,
      buttons: [
        {
          text: this.translateService.translate('Cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.translate('Yes'),
          handler: () => {
            this.executeCustomerGeneralPayment(customer, amount);
          }
        }
      ]
    });
    await alert.present();
  }

  executeCustomerGeneralPayment(customer: any, amount: number) {
    const payload = {
      customerId: customer._id,
      companyId: this.keysStorage.getItem('CompanyId'),
      payAmount: amount
    };

    this.loaderService.showLoader(this.translateService.translate('Processing payment...'));
    this.billingService.PayCustomerDues(payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(this.translateService.translate('Payment recorded successfully!'));
        this.loadCustomers();
      },
      error: (err: any) => {
        console.error('Error recording customer payment:', err);
        this.toastService.showError(this.translateService.translate('Please Contact Customer Care'));
        this.loaderService.hideLoader();
      }
    });
  }

  getItemTotal(item: any): number {
    const qty = parseFloat(item.Quantity);
    const validQty = (!isNaN(qty) && qty > 0) ? qty : 0;
    const price = item.SellingPrice || 0;
    if (item.unit === 'Weight' && item.selectedSubUnit === 'g') {
      return price * (validQty / 1000);
    }
    return price * validQty;
  }

  clearTableState() {
    this.searchQuery = '';
    this.filterType = 'pending';
    this.applyFilter();
  }
}
