import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { LoaderService } from 'src/Service/LoaderService';
@Component({
  selector: 'app-generate-bill',
  templateUrl: './generate-bill.component.html',
  styleUrls: ['./generate-bill.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class GenerateBillComponent implements OnInit, AfterViewInit {
  @Input() currentDate!: Date;
  @Input() searchQuery!: string;
  @Input() cartItems: any[] = [];
  @Input() totalPrice!: Number;
  @Input() status: 'PAID' | 'PENDING' = 'PAID';
  @Input() amountPaid: number = 0;
  @Input() balanceAmount: number = 0;

  @Output() close = new EventEmitter<void>();

  constructor(private loaderservice: LoaderService) { }

  ngOnInit() {
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
      const opt = {
        margin: 0.5,
        filename: `FreshMart_Bill_${this.currentDate.getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // @ts-ignore
      html2pdf().from(element).set(opt).save().then(() => {
        this.loaderservice.hideLoader()
        this.close.emit();
      });
    } else {
      this.close.emit();
    }
  }
}
