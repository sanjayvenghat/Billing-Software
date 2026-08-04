import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { LoaderService } from 'src/Service/LoaderService';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { TranslatePipe } from '../../Service/TranslatePipe';

@Component({
  selector: 'app-generate-bill',
  templateUrl: './generate-bill.component.html',
  styleUrls: ['./generate-bill.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, TranslatePipe, DecimalPipe]
})
export class GenerateBillComponent implements OnInit, AfterViewInit {
  @Input() currentDate!: Date;
  @Input() searchQuery!: string;
  @Input() cartItems: any[] = [];
  @Input() totalPrice!: number;
  @Input() status: 'PAID' | 'PENDING' = 'PAID';
  @Input() amountPaid: number = 0;
  @Input() balanceAmount: number = 0;
  @Input() taxPercent: number = 0;
  @Input() discountAmount: number = 0;
  @Input() mode: 'download' | 'share' = 'download';

  @Output() close = new EventEmitter<void>();
  @Output() pdfReady = new EventEmitter<File>();

  storeName: string = '';
  subtotalPrice: number = 0;
  taxAmount: number = 0;
  taxBreakdown: { rate: number, amount: number }[] = [];
  grandTotal: number = 0;
  invoiceNumber: string = '';

  constructor(
    private loaderservice: LoaderService,
    private keysStorage: KEYSSTORAGE
  ) { }

  ngOnInit() {
    this.storeName = this.keysStorage.getItem('StoreName') || '';
    this.calculateTotals();
  }

  calculateTotals() {
    this.subtotalPrice = this.cartItems.reduce((acc, item) => acc + this.getItemTotal(item), 0);
    const rateMap = new Map<number, number>();
    this.cartItems.forEach(item => {
      const rate = Number(item.GST) || 0;
      const amount = (this.getItemTotal(item) * rate) / 100;
      rateMap.set(rate, (rateMap.get(rate) || 0) + amount);
    });
    this.taxBreakdown = Array.from(rateMap.entries())
      .filter(([rate]) => rate > 0)
      .map(([rate, amount]) => ({ rate, amount }));
    this.taxAmount = this.taxBreakdown.reduce((acc, t) => acc + t.amount, 0);
    this.grandTotal = this.subtotalPrice + this.taxAmount - (this.discountAmount || 0);
    this.invoiceNumber = 'INV-' + (this.currentDate ? this.currentDate.getTime().toString().slice(-6) : Math.floor(Math.random() * 1000000));
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

  ngAfterViewInit() {
    this.loaderservice.showLoader("Generating Bill...")
    // Need a slight delay to ensure the DOM is completely ready and CSS is applied
    setTimeout(() => {
      this.confirmDownload();
    }, 100);
  }

  confirmDownload() {
    const element = document.getElementById('receipt-card-pdf');
    if (element) {
      if (this.mode === 'share') {
        this.generatePdfBlob().then(blob => {
          const file = new File([blob], `FreshMart_Bill_${this.currentDate.getTime()}.pdf`, { type: 'application/pdf' });
          this.loaderservice.hideLoader();
          this.pdfReady.emit(file);
          this.close.emit();
        }).catch(() => {
          this.loaderservice.hideLoader();
          this.close.emit();
        });
      } else {
        const opt = this.getPdfOptions();
        // @ts-ignore
        html2pdf().from(element).set(opt).save().then(() => {
          this.loaderservice.hideLoader()
          this.close.emit();
        });
      }
    } else {
      this.close.emit();
    }
  }

  private getPdfOptions() {
    return {
      margin: 0.5,
      filename: `FreshMart_Bill_${this.currentDate.getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
  }

  private generatePdfBlob(): Promise<Blob> {
    const element = document.getElementById('receipt-card-pdf');
    if (!element) {
      return Promise.reject('PDF element not found');
    }
    const opt = this.getPdfOptions();
    // @ts-ignore
    return html2pdf().from(element).set(opt).outputPdf('blob');
  }
}
