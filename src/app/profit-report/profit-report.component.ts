import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trendingUpOutline,
  cashOutline,
  walletOutline,
  statsChartOutline,
  calendarOutline,
  cubeOutline,
  personOutline,
  arrowUndoOutline,
  alertCircleOutline,
  addOutline,
  receiptOutline
} from 'ionicons/icons';
import { Billingservice } from '../billing/billingservice';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { LoaderService } from 'src/Service/LoaderService';
import { ToastService } from 'src/Service/ToasterService';
import { TranslatePipe } from '../../Service/TranslatePipe';
import { TranslateService } from '../../Service/TranslateService';

interface Transaction {
  billId: string;
  date: Date;
  customerName: string;
  totalAmount: number;
  amountPaid: number;
  balanceAmount: number;
  notes: string;
  cartItems: any[];
  calculatedCost: number;
  calculatedProfit: number;
}

@Component({
  selector: 'app-profit-report',
  templateUrl: './profit-report.component.html',
  styleUrls: ['./profit-report.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    IonBadge,
    DecimalPipe,
    TranslatePipe
  ]
})
export class ProfitReportComponent implements OnInit {
  selectedRange: 'week' | 'month' | 'all' | 'custom' = 'month';
  selectedBillType: 'all' | 'paid' | 'pending' = 'all';
  startDate: string = '';
  endDate: string = '';
  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];

  // Summary Metrics
  totalSales: number = 0;
  totalCost: number = 0;
  netProfit: number = 0;
  totalPending: number = 0;
  profitMargin: number = 0;

  // Top Products
  topProducts: any[] = [];

  constructor(
    private billingService: Billingservice,
    private keysStorage: KEYSSTORAGE,
    private loaderService: LoaderService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private router: Router
  ) {
    addIcons({
      'trending-up-outline': trendingUpOutline,
      'cash-outline': cashOutline,
      'wallet-outline': walletOutline,
      'stats-chart-outline': statsChartOutline,
      'calendar-outline': calendarOutline,
      'cube-outline': cubeOutline,
      'person-outline': personOutline,
      'arrow-undo-outline': arrowUndoOutline,
      'alert-circle-outline': alertCircleOutline,
      'add-outline': addOutline,
      'receipt-outline': receiptOutline
    });
  }

  ngOnInit() {
    this.loadData();
  }

  goBack() {
    this.router.navigate(['/GetUserDetails/billing']);
  }

  navigateToBilling() {
    this.router.navigate(['/GetUserDetails/billing']);
  }

  loadData() {
    const companyId = this.keysStorage.getItem('CompanyId');
    if (!companyId) {
      this.toastService.showError(this.translateService.translate('Company ID not found. Please log in.'));
      return;
    }

    this.loaderService.showLoader(this.translateService.translate('Loading transaction reports...'));
    this.billingService.searchUsers({ searchValue: '', companyId }).subscribe({
      next: (response: any) => {
        const users = response.userdata || [];
        this.processTransactions(users);
        this.applyFilters();
        this.loaderService.hideLoader();
      },
      error: (err: any) => {
        console.error('Error loading transactions for report:', err);
        this.toastService.showError(this.translateService.translate('Failed to load transaction details.'));
        this.loaderService.hideLoader();
      }
    });
  }

  processTransactions(users: any[]) {
    const tempTx: Transaction[] = [];

    users.forEach(user => {
      if (user.CustomerList && Array.isArray(user.CustomerList)) {
        user.CustomerList.forEach((bill: any) => {
          // Calculate cost of items in this bill
          let billCost = 0;
          if (bill.cartItems && Array.isArray(bill.cartItems)) {
            bill.cartItems.forEach((item: any) => {
              const qty = parseFloat(item.Quantity || '0');
              const validQty = (!isNaN(qty) && qty > 0) ? qty : 0;
              // If weight is in grams, cost = BuyingPrice * (qty/1000)
              const itemCostPerUnit = item.BuyingPrice || item.buyingPrice || 0;
              let itemTotalCost = itemCostPerUnit * validQty;
              if (item.unit === 'Weight' && item.selectedSubUnit === 'g') {
                itemTotalCost = itemCostPerUnit * (validQty / 1000);
              }
              billCost += itemTotalCost;
            });
          }

          const revenue = bill.totalAmount || 0;
          const profit = revenue - billCost;

          tempTx.push({
            billId: bill.billId || bill.date,
            date: bill.date ? new Date(bill.date) : new Date(),
            customerName: user.CustomerName || 'Walk-in Customer',
            totalAmount: revenue,
            amountPaid: bill.amountPaid || 0,
            balanceAmount: bill.balanceAmount || 0,
            notes: bill.notes || '',
            cartItems: bill.cartItems || [],
            calculatedCost: billCost,
            calculatedProfit: profit
          });
        });
      }
    });

    // Sort transactions from newest to oldest
    this.allTransactions = tempTx.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  applyFilters() {
    const now = new Date();
    let cutoffDate = new Date();

    if (this.selectedRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (this.selectedRange === 'month') {
      cutoffDate.setDate(now.getDate() - 30);
    }

    // Step 1: Filter by date range
    let txs: Transaction[] = [];
    if (this.selectedRange === 'all') {
      txs = [...this.allTransactions];
    } else if (this.selectedRange === 'custom') {
      const start = this.startDate ? new Date(this.startDate) : null;
      if (start) {
        start.setHours(0, 0, 0, 0);
      }
      const end = this.endDate ? new Date(this.endDate) : null;
      if (end) {
        end.setHours(23, 59, 59, 999);
      }
      txs = this.allTransactions.filter(tx => {
        if (start && tx.date < start) return false;
        if (end && tx.date > end) return false;
        return true;
      });
    } else {
      txs = this.allTransactions.filter(tx => tx.date >= cutoffDate);
    }

    // Step 2: Filter by bill payment type
    if (this.selectedBillType === 'paid') {
      txs = txs.filter(tx => tx.balanceAmount === 0);
    } else if (this.selectedBillType === 'pending') {
      txs = txs.filter(tx => tx.balanceAmount > 0);
    }

    this.filteredTransactions = txs;

    this.calculateAggregates();
    this.calculateTopProducts();
  }

  calculateAggregates() {
    let salesTotal = 0;
    let costTotal = 0;
    let profitTotal = 0;
    let pendingTotal = 0;

    this.filteredTransactions.forEach(tx => {
      salesTotal += tx.totalAmount;
      costTotal += tx.calculatedCost;
      profitTotal += tx.calculatedProfit;
      pendingTotal += tx.balanceAmount;
    });

    this.totalSales = salesTotal;
    this.totalCost = costTotal;
    this.netProfit = profitTotal;
    this.totalPending = pendingTotal;
    this.profitMargin = salesTotal > 0 ? (profitTotal / salesTotal) * 100 : 0;
  }

  calculateTopProducts() {
    const productMap = new Map<string, { qty: number; sales: number; profit: number; unit: string }>();

    this.filteredTransactions.forEach(tx => {
      if (tx.cartItems && Array.isArray(tx.cartItems)) {
        tx.cartItems.forEach((item: any) => {
          const name = item.ProductName || item.name || 'Unknown Product';
          const qty = parseFloat(item.Quantity || '0');
          const validQty = (!isNaN(qty) && qty > 0) ? qty : 0;
          const sellingPrice = item.SellingPrice || 0;
          const buyingPrice = item.BuyingPrice || item.buyingPrice || 0;

          let itemSales = sellingPrice * validQty;
          let itemCost = buyingPrice * validQty;
          if (item.unit === 'Weight' && item.selectedSubUnit === 'g') {
            itemSales = sellingPrice * (validQty / 1000);
            itemCost = buyingPrice * (validQty / 1000);
          }
          const itemProfit = itemSales - itemCost;

          const existing = productMap.get(name) || { qty: 0, sales: 0, profit: 0, unit: item.unit || 'Piece' };
          productMap.set(name, {
            qty: existing.qty + validQty,
            sales: existing.sales + itemSales,
            profit: existing.profit + itemProfit,
            unit: existing.unit
          });
        });
      }
    });

    const list: any[] = [];
    productMap.forEach((val, key) => {
      list.push({
        name: key,
        qty: val.qty,
        sales: val.sales,
        profit: val.profit,
        unit: val.unit
      });
    });

    // Sort by profit descending, take top 5
    this.topProducts = list.sort((a, b) => b.profit - a.profit).slice(0, 5);
  }

  onRangeChange(event: any) {
    this.selectedRange = event.detail.value;
    this.applyFilters();
  }

  onBillTypeChange(event: any) {
    this.selectedBillType = event.detail.value;
    this.applyFilters();
  }

  onDateChange() {
    if (this.selectedRange === 'custom') {
      this.applyFilters();
    }
  }
}
