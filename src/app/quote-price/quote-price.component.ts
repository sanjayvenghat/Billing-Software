import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton } from '@ionic/angular/standalone';
import { QuoteService } from './quote-service';
import { ToastService } from 'src/Service/ToasterService';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { IonCheckbox, IonItem, IonIcon, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { QRCodeComponent } from 'angularx-qrcode';
import { addIcons } from 'ionicons';
import { download, cubeOutline, cashOutline, pricetagOutline, scaleOutline, saveOutline, qrCodeOutline, downloadOutline, barcodeOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { LoaderService } from 'src/Service/LoaderService';
import { IonSelect, IonSelectOption, } from '@ionic/angular/standalone';

import { TranslatePipe } from '../../Service/TranslatePipe';
import { TranslateService } from '../../Service/TranslateService';

@Component({
  selector: 'app-quote-price',
  templateUrl: './quote-price.component.html',
  styleUrls: ['./quote-price.component.scss'],
  imports: [FormsModule, IonContent, IonSelect, IonSelectOption, IonInput, IonButton, IonCheckbox, IonItem, IonGrid, IonRow, IonCol, QRCodeComponent, IonIcon, TranslatePipe]
})
export class QuotePriceComponent implements OnInit {
  @Input() initialProductName: string = '';
  @Output() productSaved = new EventEmitter<any>();

  ProductName: string = '';
  BuyingPrice: string = ''
  SellingPrice: string = '';
  unit: string = '';
  ItemCode: string = '';
  companyId: string = '';
  generateQrCode: boolean = false;
  savedItemUrl: string = '';
  showProfitOfEveryProduct: boolean = true;
  enableGst: boolean = false;
  gstRate: number = 5;
  gstRates: { gst: number, cgst: number, sgst: number, igst: number }[] = [
    { gst: 0, cgst: 0, sgst: 0, igst: 0 },
    { gst: 0.25, cgst: 0.125, sgst: 0.125, igst: 0.25 },
    { gst: 3, cgst: 1.5, sgst: 1.5, igst: 3 },
    { gst: 5, cgst: 2.5, sgst: 2.5, igst: 5 },
    { gst: 12, cgst: 6, sgst: 6, igst: 12 },
    { gst: 18, cgst: 9, sgst: 9, igst: 18 },
    { gst: 28, cgst: 14, sgst: 14, igst: 28 }
  ];

  constructor(
    private quoteService: QuoteService,
    private toaster: ToastService,
    private keysStorage: KEYSSTORAGE,
    private LoaderService: LoaderService,
    private translateService: TranslateService
  ) {
    addIcons({ download, cubeOutline, cashOutline, pricetagOutline, scaleOutline, saveOutline, qrCodeOutline, downloadOutline, barcodeOutline });
  }

  ngOnInit() {
    this.loadSettings();
    this.getCredentials();
    if (this.initialProductName) {
      this.ProductName = this.initialProductName;
    }
  }
  loadSettings() {
    const saved = this.keysStorage.getItem('APP_SETTINGS');
    if (saved) {
      this.showProfitOfEveryProduct = saved.showProfitOfEveryProduct ?? true;
    } else {
      this.showProfitOfEveryProduct = true;
    }
  }
  getCredentials() {
    this.companyId = this.keysStorage.getItem("CompanyId")
  }
  AddGroceryData() {
    if (!this.showProfitOfEveryProduct) {
      this.SellingPrice = this.BuyingPrice;
    }
    if (!this.ProductName || !this.BuyingPrice || !this.SellingPrice || !this.unit) {
      const msg = this.showProfitOfEveryProduct
        ? this.translateService.translate("Please enter product name, buying price, selling price and select unit")
        : this.translateService.translate("Please enter product name, buying price and select unit");
      this.toaster.showWarning(msg);
      return;
    }
    this.LoaderService.showLoader(this.translateService.translate("Please wait while adding product"))
    let payload = {
      "ProductName": this.ProductName,
      "BuyingPrice": this.BuyingPrice,
      "SellingPrice": this.SellingPrice,
      "Unit": this.unit,
      "ItemCode": this.ItemCode,
      "GST": this.enableGst ? this.gstRate : 0,
      "CompanyId": this.companyId
    }
    this.quoteService.AddgroceryData(payload).subscribe({
      next: (val: any) => {
        if (val.message.includes("Added Successfully")) {
          // Generate the unique QR code URL using the ID returned from backend
          if (val.CreatedUserInfo && val.CreatedUserInfo._id) {
            this.savedItemUrl = `${environment.LoginUrl}/view-item/getItem?id=${val.CreatedUserInfo._id}`;

          }
          this.LoaderService.hideLoader();

          this.ProductName = "";
          this.BuyingPrice = "";
          this.SellingPrice = "";
          this.unit = "";
          this.ItemCode = "";
          this.toaster.showSuccess(this.translateService.translate(val.message));
          this.productSaved.emit(val.CreatedUserInfo || true);
        }
        else {
          this.LoaderService.hideLoader();
          this.toaster.showWarning(this.translateService.translate(val.message))
        }
      },
      error: (err: any) => {
        this.LoaderService.hideLoader();
        console.error('Error fetching grocery data:', err);
      }
    });

  }
  downloadQR() {
    const canvas = document.querySelector('canvas');

    if (canvas) {
      const url = canvas.toDataURL('image/png');

      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.png';
      a.click();
    }
  }

  getGstSplitInfo(): string {
    const opt = this.gstRates.find(o => o.gst === this.gstRate);
    if (!opt || opt.gst === 0) {
      return '';
    }
    return `CGST ${opt.cgst}% + SGST ${opt.sgst}% (Intra-State) | IGST ${opt.igst}% (Inter-State)`;
  }

  clearQuoteState() {
    this.ProductName = '';
    this.BuyingPrice = '';
    this.SellingPrice = '';
    this.unit = '';
    this.ItemCode = '';
    this.generateQrCode = false;
    this.savedItemUrl = '';
    this.enableGst = false;
    this.gstRate = 5;
  }
}
