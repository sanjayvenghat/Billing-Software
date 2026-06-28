import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton } from '@ionic/angular/standalone';
import { QuoteService } from './quote-service';
import { ToastService } from 'src/Service/ToasterService';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { IonCheckbox, IonItem, IonIcon } from '@ionic/angular/standalone';
import { QRCodeComponent } from 'angularx-qrcode';
import { addIcons } from 'ionicons';
import { download } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { LoaderService } from 'src/Service/LoaderService';
@Component({
  selector: 'app-quote-price',
  templateUrl: './quote-price.component.html',
  styleUrls: ['./quote-price.component.scss'],
  imports: [FormsModule, IonContent, IonInput, IonButton, IonCheckbox, IonItem, QRCodeComponent, IonIcon]
})
export class QuotePriceComponent implements OnInit {

  ProductName: string = '';
  BuyingPrice: string = '';
  SellingPrice: string = '';
  companyId: string = '';
  generateQrCode: boolean = false;
  savedItemUrl: string = '';

  constructor(private quoteService: QuoteService, private toaster: ToastService, private keysStorage: KEYSSTORAGE, private LoaderService: LoaderService) {
    addIcons({ download });
  }

  ngOnInit() {
    this.getCredentials();
  }
  getCredentials() {
    this.companyId = this.keysStorage.getItem("CompanyId")
  }
  AddGroceryData() {
    if (!this.ProductName || !this.BuyingPrice || !this.SellingPrice) {
      this.toaster.showWarning('Please enter product name, buying price and selling price');
      return;
    }
    this.LoaderService.showLoader("Please wait while adding product")
    let payload = {
      "ProductName": this.ProductName,
      "BuyingPrice": this.BuyingPrice,
      "SellingPrice": this.SellingPrice,
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
          this.toaster.showSuccess(val.message);
        }
        else {
          this.LoaderService.hideLoader();
          this.toaster.showWarning(val.message)
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
}
