import { Component, OnInit, OnDestroy } from '@angular/core';

import { IonHeader, IonSearchbar, IonButtons, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonPopover, IonModal, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barcodeOutline, addOutline, personAddOutline, personOutline, searchOutline, trashOutline, addCircleOutline, removeCircleOutline, arrowForwardOutline, closeCircle, cartOutline, downloadOutline, personCircle, alertCircleOutline, close } from 'ionicons/icons';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/Service/ToasterService';
import { IonFooter } from '@ionic/angular/standalone';
import { Billingservice } from './billingservice';
import { FormsModule } from '@angular/forms';
import { LoaderService } from 'src/Service/LoaderService';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { documentTextOutline, documentOutline } from 'ionicons/icons'
import { GenerateBillComponent } from '../generate-bill/generate-bill.component';
import { AddProductComponent } from '../add-product/add-product.component';
import { QuotePriceBillingComponent } from '../quote-price-billing/quote-price-billing.component';
import { PendingComponent } from '../pending/pending.component';
import { AddUserComponent } from '../add-user/add-user.component';
import { CreateUserComponent } from '../create-user/create-user.component';
@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  imports: [HttpClientModule, IonHeader, IonSearchbar, IonButtons, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonFooter, FormsModule, GenerateBillComponent, AddProductComponent, QuotePriceBillingComponent, PendingComponent, AddUserComponent, CreateUserComponent, IonToolbar, IonTitle, IonContent, IonModal]
})
export class BillingComponent implements OnInit, OnDestroy {
  private scanner: Html5QrcodeScanner | null = null;
  isScanning = false;
  isProductModalOpen = false;
  isBillModalOpen = false;
  isCustomDialogOpen = false;
  currentDate: Date = new Date();
  scannedProduct: any = null;
  errorMessage: string = '';
  searchQuery: any = {}
  totalPrice: Number = 0;
  isPendingModalOpen: boolean = false;
  isAddUserModalOpen: any = false;
  isCreateUserModalOpen: boolean = false;
  pendingAmountPaid: number = 0;
  pendingBalanceAmount: number = 0;
  constructor(private http: HttpClient, private toasterService: ToastService, private BillingService: Billingservice, private keysStorage: KEYSSTORAGE, private LoaderService: LoaderService) {
    addIcons({
      barcodeOutline, 'add-outline': addOutline, 'person-add-outline': personAddOutline, 'person-outline': personOutline, 'search-outline': searchOutline, 'trash-outline': trashOutline, 'add-circle-outline': addCircleOutline, 'remove-circle-outline': removeCircleOutline, 'arrow-forward-outline': arrowForwardOutline,
      'document-text-outline': documentTextOutline,
      'document-outline': documentOutline,
      'close-circle': closeCircle,
      'cart-outline': cartOutline,
      'download-outline': downloadOutline,
      'person-circle': personCircle,
      'alert-circle-outline': alertCircleOutline,
      close
    });
  }
  SearchProduct: string = "";
  userSuggestions: any[] = [];
  productSuggestions: any[] = [];
  cartItems: any[] = [];

  ngOnInit() {
    setTimeout(() => {
      this.toasterService.showWarning("To Save In the Data Please Add User Else Billing Alone can be done");
    }, 1000)
  }

  ngOnDestroy() {
    this.stopScanner();
  }

  onSearch(event: any) {
    const value = event.detail.value;
    if (value) {
      this.fetchProductDetails(value);
    }
  }
  OnSearchproduct(event: any) {
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
        if (response?.userdata?.length === 0) {
          this.isCustomDialogOpen = true;
        }
        else {
          this.productSuggestions = response?.userdata ?? []
        }
      },
      error: (err) => {
        console.error('Error fetching product details:', err);
        this.productSuggestions = [];
      }
    })
  }

  selectProduct(product: any) {
    this.SearchProduct = ''; // Clear search
    this.productSuggestions = [];
    if (product.Barcode) {
      this.fetchProductDetails(product.Barcode);
    } else {
      this.addToCart(product);
    }
  }

  calculateTotal() {
    this.totalPrice = this.cartItems.reduce((acc, item) => acc + ((item.SellingPrice || 0) * (item.Quantity || 1)), 0);
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
    this.calculateTotal();
  }

  increaseQuantity(index: number) {
    this.cartItems[index].Quantity++;
    this.calculateTotal();
  }

  decreaseQuantity(index: number) {
    if (this.cartItems[index].Quantity > 1) {
      this.cartItems[index].Quantity--;
    } else {
      this.cartItems.splice(index, 1);
    }
    this.calculateTotal();
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.calculateTotal();
  }

  onUserSearchInput(event: any) {
    const rawQuery = event.detail.value || '';
    const searchValue = rawQuery.toLowerCase().replace(/\s+/g, '');
    let query = {
      searchValue: searchValue,
      companyId: this.keysStorage.getItem("CompanyId")
    }

    this.BillingService.searchUsers(query).subscribe({
      next: (response: any) => {
        if (response?.userdata?.length === 0) {
          this.errorMessage = '';
          this.isAddUserModalOpen = true;
        }
        else {
          this.userSuggestions = response.userdata;
          this.errorMessage = '';
        }
      },
      error: (err) => {
        console.error('Error fetching user details from barcode id:', err);
        this.userSuggestions = [];
        this.errorMessage = 'User not found in databases.';
      }
    });
  }

  selectUser(user: any) {
    this.searchQuery = { customerName: user.CustomerName, customerId: user._id };
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

  onScanSuccess(decodedText: string) {
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

  OpenProductModelFromDialog() {
    this.isCustomDialogOpen = false;
    this.isProductModalOpen = true;
  }
  billStatus: 'PAID' | 'PENDING' = 'PAID';

  onPendingCheckout() {
    if (this.cartItems.length === 0) {
      this.toasterService.showWarning("Cannot Mark Payment As Cart is Empty");
      return;
    }
    this.isPendingModalOpen = true;
  }

  handlePendingConfirm(event: { amountPaid: number, balanceAmount: number, dueDate?: string, notes?: string }) {
    this.pendingAmountPaid = event.amountPaid;
    this.pendingBalanceAmount = event.balanceAmount;
    this.billStatus = 'PENDING';
    this.currentDate = new Date();
    this.isPendingModalOpen = false;
    let request = {
      customerId: this.searchQuery.customerId,
      companyId: this.keysStorage.getItem("CompanyId"),
      totalAmount: this.totalPrice,
      amountPaid: event.amountPaid,
      balanceAmount: event.balanceAmount,
      notes: event.notes,
      cartItems: this.cartItems
    }
    this.LoaderService.showLoader(`Pending Bill for the customer ${this.searchQuery.customerName}`)
    this.BillingService.SavePendingBill(request).subscribe({
      next: (response: any) => {
        this.toasterService.showSuccess(`Pending Bill Saved Successfully for the customer ${this.searchQuery.customerName}`);
      },
      error: (err) => {
        console.error('Error fetching product details from barcode id:', err);
        this.toasterService.showError("Error Saving Pending Bill");
        this.LoaderService.hideLoader();
      }
    })
    // Wait for the modal dismissal transition to complete (300ms) before launching the PDF generator
    setTimeout(() => {
      this.isBillModalOpen = true;
    }, 350);
  }

  DownloadPDF() {
    if (this.cartItems.length === 0) {
      this.toasterService.showWarning("Cart is empty. Cannot generate bill.");
      return;
    }
    this.billStatus = 'PAID';
    this.currentDate = new Date();
    this.isBillModalOpen = true;
  }
  OpenUserModalFromDialog(event: any) {
    this.isAddUserModalOpen = false;
    this.isCreateUserModalOpen = true;
  }
  handleCustomerAdded(response: any) {
    this.isCreateUserModalOpen = false;
    if (response) {
      const user = response.userdata || response.data || response.user || response;
      const name = user.CustomerName || user.customerName;
      const id = user._id || user.id;
      if (name) {
        this.searchQuery = { customerName: name, customerId: id };
        this.toasterService.showSuccess(`Selected customer: ${name}`);
      }
    }
  }
}