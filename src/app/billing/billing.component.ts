import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonSearchbar, IonToolbar, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barcodeOutline } from 'ionicons/icons';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  imports: [CommonModule, HttpClientModule, IonHeader, IonSearchbar, IonToolbar, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent]
})
export class BillingComponent implements OnInit, OnDestroy {
  private scanner: Html5QrcodeScanner | null = null;
  isScanning = false;
  scannedProduct: any = null;
  errorMessage: string = '';

  constructor(private http: HttpClient) {
    addIcons({ barcodeOutline });
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.stopScanner();
  }

  onSearch(event: any) {
    const value = event.detail.value;
    if (value) {
      console.log(`Manual/Physical Barcode Entered: ${value}`);
      this.fetchProductDetails(value);
    }
  }

  scanBarcode() {
    this.isScanning = true;
    this.scannedProduct = null;
    this.errorMessage = '';
    setTimeout(() => {
      // 1D barcodes like EAN/UPC require a wider capture box and higher fps for accurate reading
      this.scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 30,
          qrbox: { width: 350, height: 150 },
          aspectRatio: 1.0,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39
          ],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        },
        /* verbose= */ false
      );
      this.scanner.render(this.onScanSuccess.bind(this), this.onScanFailure.bind(this));
    }, 100);
  }

  stopScanner() {
    if (this.scanner) {
      this.scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
      this.scanner = null;
    }
    this.isScanning = false;
  }

  onScanSuccess(decodedText: string, decodedResult: any) {
    console.log(`Barcode Scanned = ${decodedText}`);
    this.stopScanner();
    this.fetchProductDetails(decodedText);
  }

  onScanFailure(error: any) {
    // console.warn(`Code scan error = ${error}`);
  }

  fetchProductDetails(id: string) {
    const url = `${environment.LoginUrl}/api/grocery/getProductDetails?id=${id}`;
    this.http.get(url).subscribe({
      next: (response: any) => {
        console.log('Product Details Fetched Successfully:');
        console.log(response);
        this.scannedProduct = response.data;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error fetching product details from barcode id:', err);
        this.scannedProduct = null;
        this.errorMessage = 'Product not found in databases.';
      }
    });
  }
}
