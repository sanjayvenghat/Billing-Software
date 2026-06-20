import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonSearchbar, IonToolbar, IonButtons, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonPopover, IonModal } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barcodeOutline, addOutline, personAddOutline, personOutline, searchOutline, trashOutline, addCircleOutline, removeCircleOutline } from 'ionicons/icons';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/Service/ToasterService';
import { IonFooter, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Billingservice } from './billingservice';
import { FormsModule } from '@angular/forms';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  imports: [IonContent, CommonModule, HttpClientModule, IonHeader, IonSearchbar, IonToolbar, IonButtons, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonFooter, IonTitle, FormsModule, IonModal]
})
export class BillingComponent implements OnInit, OnDestroy {
  private scanner: Html5QrcodeScanner | null = null;
  isScanning = false;
  isProductModalOpen = false;
  scannedProduct: any = null;
  errorMessage: string = '';
  searchQuery: string = ""
  constructor(private http: HttpClient, private toasterService: ToastService, private BillingService: Billingservice, private keysStorage: KEYSSTORAGE) {
    addIcons({ barcodeOutline, 'add-outline': addOutline, 'person-add-outline': personAddOutline, 'person-outline': personOutline, 'search-outline': searchOutline, 'trash-outline': trashOutline, 'add-circle-outline': addCircleOutline, 'remove-circle-outline': removeCircleOutline });
  }
  SearchProduct: string = "";
  userSuggestions: any[] = [];
  productSuggestions: any[] = [];
  cartItems: any[] = [];

  ngOnInit() {
    this.toasterService.showWarning("To Save In the Data Please Add User Else Billing Alone can be done");
  }

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
  OnSearchproduct(event: any) {
    console.log(event, "SearchProduct")
    const rawQuery = event.target.value || '';
    if (!rawQuery.trim()) {
      this.productSuggestions = [];
      return;
    }
    let query = {
      searchValue: rawQuery,
      companyId: this.keysStorage.getItem("CompanyId")
    }
    this.BillingService.searchProduct(query).subscribe({
      next: (response: any) => {
        console.log('Product Details Fetched Successfully:');
        console.log(response);
        this.productSuggestions = response.userdata || response.data || (Array.isArray(response) ? response : []);
      },
      error: (err) => {
        console.error('Error fetching product details:', err);
        this.productSuggestions = [];
      }
    })
    console.log(query, "event")
  }

  selectProduct(product: any) {
    console.log('Selected Product:', product);
    this.SearchProduct = ''; // Clear search
    this.productSuggestions = [];
    if (product.Barcode) {
      this.fetchProductDetails(product.Barcode);
    } else {
      this.addToCart(product);
    }
  }

  addToCart(product: any) {
    if (!product) return;
    const existingItem = this.cartItems.find(item =>
      (item.Barcode && item.Barcode === product.Barcode) ||
      (item._id && item._id === product._id)
    );
    if (existingItem) {
      existingItem.Quantity = (existingItem.Quantity || 1) + 1;
    } else {
      product.Quantity = 1;
      this.cartItems.push(product);
    }
    this.scannedProduct = product; // keep it if needed
  }

  increaseQuantity(index: number) {
    this.cartItems[index].Quantity++;
  }

  decreaseQuantity(index: number) {
    if (this.cartItems[index].Quantity > 1) {
      this.cartItems[index].Quantity--;
    } else {
      this.cartItems.splice(index, 1);
    }
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
  }

  onUserSearchInput(event: any) {
    debugger
    const rawQuery = event.detail.value || '';
    const searchValue = rawQuery.toLowerCase().replace(/\s+/g, '');
    let query = {
      searchValue: searchValue,
      companyId: this.keysStorage.getItem("CompanyId")
    }
    this.BillingService.searchUsers(query).subscribe({
      next: (response: any) => {
        console.log('User Details Fetched Successfully:');
        console.log(response);
        this.userSuggestions = response.userdata;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error fetching user details from barcode id:', err);
        this.userSuggestions = [];
        this.errorMessage = 'User not found in databases.';
      }
    });
  }

  selectUser(user: any) {
    console.log('Selected User:', user);
    this.searchQuery = user.CustomerName;
    this.userSuggestions = [];
    // Logic to attach user to the current bill can go here
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
        this.addToCart(response.data || response);
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error fetching product details from barcode id:', err);
        this.scannedProduct = null;
        this.errorMessage = 'Product not found in databases.';
      }
    });
  }
  OpenProductModel() {
    if (this.SearchProduct == "") {
      this.toasterService.showWarning("Please Enter Product Name");
      return;
    }
    this.isProductModalOpen = true
  }

}