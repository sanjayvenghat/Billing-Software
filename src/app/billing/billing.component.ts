import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActionSheetController, AlertController } from '@ionic/angular/standalone';

import { IonHeader, IonSearchbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonPopover, IonModal, IonToolbar, IonTitle, IonContent, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barcodeOutline, addOutline, removeOutline, cubeOutline, personAddOutline, personOutline, searchOutline, trashOutline, addCircleOutline, removeCircleOutline, arrowForwardOutline, closeCircle, cartOutline, downloadOutline, personCircle, alertCircleOutline, close, logoWhatsapp, shareSocialOutline, chatbubbleEllipsesOutline, pricetagOutline, flash, flashOutline } from 'ionicons/icons';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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
import { QuotePriceBillingComponent } from '../quote-price-billing/quote-price-billing.component';
import { PendingComponent } from '../pending/pending.component';
import { CreateUserComponent } from '../create-user/create-user.component';
import { TranslatePipe } from '../../Service/TranslatePipe';
import { TranslateService } from '../../Service/TranslateService';
@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  imports: [HttpClientModule, IonHeader, IonSearchbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonFooter, FormsModule, GenerateBillComponent, QuotePriceBillingComponent, PendingComponent, CreateUserComponent, IonToolbar, IonTitle, IonContent, IonModal, IonInput, DecimalPipe, TranslatePipe]
})
export class BillingComponent implements OnInit, OnDestroy {
  private scanner: Html5Qrcode | null = null;
  isTorchSupported = false;
  isTorchOn = false;
  isScanning = false;
  scannedBarcode = '';
  isProductModalOpen = false;
  isBillModalOpen = false;
  isSharePopupOpen = false;
  generatedPdfFile: File | null = null;
  isCustomDialogOpen = false;
  currentDate: Date = new Date();
  scannedProduct: any = null;
  errorMessage: string = '';
  searchQuery: any = {};
  totalPrice: number = 0;
  subtotalPrice: number = 0;
  taxPercent: number = 0;
  discountAmount: number = 0;
  discountType: 'amount' | 'percent' = 'amount';
  discountInput: number = 0;
  paymentType: string = 'Cash';
  isPendingModalOpen: boolean = false;
  isAddUserModalOpen: any = false;
  isCreateUserModalOpen: boolean = false;
  pendingAmountPaid: number = 0;
  pendingBalanceAmount: number = 0;
  billShareMode: 'download' | 'share' = 'download';
  private pendingShareTarget: 'whatsapp' | 'sms' | null = null;
  @ViewChild('billingFooter') billingFooterRef?: ElementRef<HTMLElement>;
  constructor(
    private http: HttpClient,
    private toasterService: ToastService,
    private BillingService: Billingservice,
    private keysStorage: KEYSSTORAGE,
    private LoaderService: LoaderService,
    private translateService: TranslateService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) {
    addIcons({
      barcodeOutline, 'add-outline': addOutline, 'remove-outline': removeOutline, 'cube-outline': cubeOutline, 'person-add-outline': personAddOutline, 'person-outline': personOutline, 'search-outline': searchOutline, 'trash-outline': trashOutline, 'add-circle-outline': addCircleOutline, 'remove-circle-outline': removeCircleOutline, 'arrow-forward-outline': arrowForwardOutline,
      'document-text-outline': documentTextOutline,
      'document-outline': documentOutline,
      'close-circle': closeCircle,
      'cart-outline': cartOutline,
      'download-outline': downloadOutline,
      'person-circle': personCircle,
      'alert-circle-outline': alertCircleOutline,
      'logo-whatsapp': logoWhatsapp,
      'share-social-outline': shareSocialOutline,
      'chatbubble-ellipses-outline': chatbubbleEllipsesOutline,
      'pricetag-outline': pricetagOutline,
      flash, 'flash-outline': flashOutline,
      close
    });
  }
  SearchProduct: string = "";
  userSuggestions: any[] = [];
  productSuggestions: any[] = [];
  cartItems: any[] = [];

  ngOnInit() {
    this.vhBaseline = window.innerHeight;
    window.visualViewport?.addEventListener('resize', this.pinFooterToBottom);
    setTimeout(() => {
      this.toasterService.showWarning(this.translateService.translate("To Save In the Data Please Add User Else Billing Alone can be done"));
    }, 1000)
  }

  ngOnDestroy() {
    window.visualViewport?.removeEventListener('resize', this.pinFooterToBottom);
    this.stopScanner();
  }

  private vhBaseline = 0;

  private pinFooterToBottom = () => {
    const footer = this.billingFooterRef?.nativeElement;
    if (!footer) return;
    const shrink = Math.max(0, this.vhBaseline - window.innerHeight);
    footer.style.transform = shrink > 0 ? `translateY(${shrink}px)` : '';
  };

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
          this.presentProductNotFoundAlert();
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

  getItemTotal(item: any): number {
    const qty = parseFloat(item.Quantity);
    const validQty = (!isNaN(qty) && qty > 0) ? qty : 0;
    const price = item.SellingPrice || 0;
    if (item.unit === 'Weight' && item.selectedSubUnit === 'g') {
      return price * (validQty / 1000);
    }
    return price * validQty;
  }

  calculateTotal() {
    this.subtotalPrice = this.cartItems.reduce((acc, item) => {
      return acc + this.getItemTotal(item);
    }, 0);

    const raw = isNaN(Number(this.discountInput)) ? 0 : Number(this.discountInput);
    let discount = this.discountType === 'percent'
      ? (this.subtotalPrice * raw) / 100
      : raw;
    if (discount < 0) discount = 0;
    if (discount > this.subtotalPrice) discount = this.subtotalPrice;
    this.discountAmount = Math.round(discount * 100) / 100;
    this.totalPrice = Math.round((this.subtotalPrice - this.discountAmount) * 100) / 100;
  }

  setDiscountType(type: 'amount' | 'percent') {
    this.discountType = type;
    this.calculateTotal();
  }

  clearDiscount() {
    this.discountInput = 0;
    this.calculateTotal();
  }

  onQuantityChange(item: any) {
    let qty = parseFloat(item.Quantity);
    if (isNaN(qty) || qty <= 0) {
      item.Quantity = 1;
    }
    this.calculateTotal();
  }

  addToCart(product: any) {
    if (!product) return;

    // Normalize unit if empty or unknown
    if (!product.unit || (product.unit !== 'Weight' && product.unit !== 'Piece')) {
      product.unit = 'Piece';
    }

    const existingItem = this.cartItems.find(item =>
      (item.Barcode && item.Barcode === product.Barcode) ||
      (item._id && item._id === product._id)
    );
    if (existingItem) {
      existingItem.Quantity = (existingItem.Quantity || 1) + 1;
    } else {
      product.Quantity = 1;
      if (product.unit === 'Weight') {
        product.selectedSubUnit = 'kg';
      }
      this.cartItems.push(product);
    }
    this.scannedProduct = product; // keep it if needed
    this.calculateTotal();
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const content = document.querySelector('ion-content');
      if (content && typeof (content as any).scrollToBottom === 'function') {
        (content as any).scrollToBottom(300);
      }
    }, 100);
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
    if (!rawQuery.trim()) {
      this.userSuggestions = [];
      this.errorMessage = '';
      this.isAddUserModalOpen = false;
      return;
    }
    const searchValue = rawQuery.toLowerCase().replace(/\s+/g, '');
    let query = {
      searchValue: searchValue,
      companyId: this.keysStorage.getItem("CompanyId")
    }

    this.BillingService.searchUsers(query).subscribe({
      next: (response: any) => {
        if (response?.userdata?.length === 0) {
          this.errorMessage = '';
          this.presentUserNotFoundAlert();
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
    this.searchQuery = {
      customerName: user.CustomerName,
      customerId: user._id,
      mobileNumber: user.MobileNumber
    };
    this.userSuggestions = [];
    // Logic to attach user to the current bill can go here
  }

  scanBarcode() {
    this.isScanning = true;
    this.scannedProduct = null;
    this.errorMessage = '';
    this.isTorchOn = false;
    this.isTorchSupported = false;
    this.scannedBarcode = '';

    setTimeout(() => {
      try {
        this.scanner = new Html5Qrcode("reader", {
          verbose: false,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39
          ],
          useBarCodeDetectorIfSupported: true
        });

        // 1D barcodes scan best with a rectangular layout box (aspect ratio 4:3 matches default viewfinder container)
        const config = {
          fps: 30,
          qrbox: { width: 260, height: 120 },
          aspectRatio: 1.333333
        };

        this.scanner.start(
          { facingMode: "environment" },
          config,
          this.onScanSuccess.bind(this),
          this.onScanFailure.bind(this)
        ).then(() => {
          this.checkTorchSupport();
        }).catch(err => {
          console.error("Failed to start camera scan:", err);
          this.errorMessage = 'Could not access the camera. Make sure permissions are granted.';
          this.isScanning = false;
        });
      } catch (err) {
        console.error("Failed to initialize Html5Qrcode:", err);
        this.isScanning = false;
      }
    }, 150);
  }

  checkTorchSupport() {
    if (this.scanner) {
      try {
        const capabilities = this.scanner.getRunningTrackCameraCapabilities();
        this.isTorchSupported = capabilities.torchFeature()?.isSupported() || false;
      } catch (e) {
        console.warn("Torch capability check failed:", e);
        this.isTorchSupported = false;
      }
    }
  }

  toggleTorch() {
    if (this.scanner && this.isTorchSupported) {
      try {
        const torch = this.scanner.getRunningTrackCameraCapabilities().torchFeature();
        const nextState = !this.isTorchOn;
        torch.apply(nextState).then(() => {
          this.isTorchOn = nextState;
        }).catch(err => {
          console.error("Failed to toggle torch:", err);
        });
      } catch (e) {
        console.error("Failed to apply torch constraint:", e);
      }
    }
  }

  stopScanner() {
    if (this.scanner) {
      const p = this.scanner.isScanning ? this.scanner.stop() : Promise.resolve();
      p.then(() => {
        this.scanner = null;
      }).catch(error => {
        console.error("Failed to stop html5Qrcode. ", error);
        this.scanner = null;
      });
    }
    this.isScanning = false;
    this.isTorchOn = false;
    this.isTorchSupported = false;
  }

  onScanSuccess(decodedText: string) {
    this.stopScanner();
    this.fetchProductDetails(decodedText);
  }

  onScanFailure(error: any) {
    // console.warn(`Code scan error = ${error}`);
  }
  fetchProductDetails(id: string) {
    const token = this.keysStorage.getItem("Token");
    const companyId = this.keysStorage.getItem("CompanyId");
    const url = `${environment.LoginUrl}/api/grocery/getProductDetails?id=${id}&CompanyId=${companyId}`;
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.get(url, { headers }).subscribe({
      next: (response: any) => {
        this.addToCart(response.data || response);
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error fetching product details from barcode id:', err);
        this.scannedProduct = null;
        this.errorMessage = 'Product not found in databases.';
        // Auto-open Quote Price / Add Product modal with barcode prepopulated
        this.scannedBarcode = id;
        this.isProductModalOpen = true;
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
      this.toasterService.showWarning(this.translateService.translate("Cannot Mark Payment As Cart is Empty"));
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
    this.LoaderService.showLoader(this.translateService.translate("Pending Bill for the customer") + " " + this.searchQuery.customerName)
    this.BillingService.SavePendingBill(request).subscribe({
      next: (response: any) => {
        this.toasterService.showSuccess(this.translateService.translate("Pending Bill Saved Successfully for the customer") + " " + this.searchQuery.customerName);
      },
      error: (err) => {
        console.error('Error fetching product details from barcode id:', err);
        this.toasterService.showError(this.translateService.translate("Error Saving Pending Bill"));
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
      this.toasterService.showWarning(this.translateService.translate("Cart is empty. Cannot generate bill."));
      return;
    }
    this.billStatus = 'PAID';
    this.currentDate = new Date();
    this.pendingAmountPaid = this.totalPrice;
    this.pendingBalanceAmount = 0;

    let request = {
      customerId: this.searchQuery.customerId || null,
      companyId: this.keysStorage.getItem("CompanyId"),
      totalAmount: this.totalPrice,
      amountPaid: this.totalPrice,
      balanceAmount: 0,
      notes: 'Paid Invoice',
      cartItems: this.cartItems
    };

    this.LoaderService.showLoader(this.translateService.translate("Saving invoice details..."));
    this.BillingService.SavePendingBill(request).subscribe({
      next: (response: any) => {
        this.LoaderService.hideLoader();
        this.toasterService.showSuccess(this.translateService.translate("Invoice Saved Successfully"));
        // Open the bill generator modal to download PDF
        this.isBillModalOpen = true;
      },
      error: (err) => {
        console.error('Error saving paid bill details:', err);
        this.LoaderService.hideLoader();
        this.toasterService.showError(this.translateService.translate("Error saving invoice details. Please try again."));
      }
    });
  }

  async shareBill() {
    if (this.cartItems.length === 0) {
      this.toasterService.showWarning(this.translateService.translate("Cart is empty. Cannot share bill."));
      return;
    }
    if (!this.searchQuery?.customerName) {
      this.toasterService.showWarning(this.translateService.translate("Please select a customer before sharing the bill."));
      return;
    }
    const mobile = (this.searchQuery?.mobileNumber || '').toString().replace(/[^0-9]/g, '');
    if (!mobile) {
      this.toasterService.showWarning(this.translateService.translate("Selected customer has no mobile number. Please add a mobile number."));
      return;
    }

    const message = this.buildBillMessage();

    const actionSheet = await this.actionSheetController.create({
      header: this.translateService.translate('Share Bill'),
      subHeader: this.searchQuery.customerName + ' (' + mobile + ')',
      buttons: [
        {
          text: this.translateService.translate('WhatsApp'),
          icon: 'logo-whatsapp',
          handler: () => {
            this.dismissAndSharePdf(mobile, message);
          }
        },
        {
          text: this.translateService.translate('SMS'),
          icon: 'chatbubble-ellipses-outline',
          handler: () => {
            window.location.href = `sms:${mobile}?&body=${encodeURIComponent(message)}`;
          }
        },
        {
          text: this.translateService.translate('Cancel'),
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  private async dismissAndSharePdf(mobile: string, message: string) {
    await this.actionSheetController.dismiss();
    this.billShareMode = 'share';
    this.pendingShareTarget = 'whatsapp';
    this.isBillModalOpen = true;
  }

  async onPdfReady(file: File) {
    const target = this.pendingShareTarget;
    this.pendingShareTarget = null;
    this.isBillModalOpen = false;
    this.billShareMode = 'download';

    if (target !== 'whatsapp') {
      return;
    }

    this.generatedPdfFile = file;
    this.isSharePopupOpen = true;
  }

  triggerNativeShare() {
    if (this.generatedPdfFile) {
      const message = this.buildBillMessage();
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        navigator.share({
          files: [this.generatedPdfFile],
          title: 'Invoice',
          text: message
        }).then(() => {
          this.isSharePopupOpen = false;
          this.generatedPdfFile = null;
        }).catch(err => {
          console.warn("Native share failed, using fallback:", err);
          this.openWhatsappFallback(message);
        });
      } else {
        console.warn("Native share not supported, using fallback");
        this.openWhatsappFallback(message);
      }
    }
  }

  private openWhatsappFallback(message: string) {
    const mobile = (this.searchQuery?.mobileNumber || '').toString().replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${mobile}?text=${encodeURIComponent(message)}`, '_blank');
    this.isSharePopupOpen = false;
    this.generatedPdfFile = null;
  }

  private buildBillMessage(): string {
    const storeName = this.keysStorage.getItem('StoreName') || 'Store';
    const customer = this.searchQuery?.customerName || 'Customer';
    const date = new Date();
    const dateStr = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
      + ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const lines: string[] = [];
    lines.push(`🧾 *${storeName}*`);
    lines.push(`Invoice for *${customer}*`);
    lines.push(`Date: ${dateStr}`);
    lines.push('------------------------------');
    this.cartItems.forEach(item => {
      const itemName = item.ProductName || item.name;
      const qty = parseFloat(item.Quantity);
      const validQty = (!isNaN(qty) && qty > 0) ? qty : 0;
      const unit = item.unit === 'Weight' ? (item.selectedSubUnit || 'kg') : 'Pcs';
      lines.push(`${itemName} x ${validQty} ${unit} - ₹${this.getItemTotal(item).toFixed(2)}`);
    });
    lines.push('------------------------------');
    lines.push(`*Total: ₹${this.totalPrice.toFixed(2)}*`);
    lines.push('Thank you for shopping with us!');
    return lines.join('\n');
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
      const mobile = user.MobileNumber || user.mobileNumber || user.phoneNumber;
      if (name) {
        this.searchQuery = { customerName: name, customerId: id, mobileNumber: mobile };
        this.toasterService.showSuccess(this.translateService.translate("Selected customer:") + " " + name);
      }
    }
  }

  async presentProductNotFoundAlert() {
    const alert = await this.alertController.create({
      header: this.translateService.translate('Product Not Found'),
      message: this.translateService.translate("We couldn't find this product in your database. Would you like to add it manually?"),
      buttons: [
        {
          text: this.translateService.translate('No, Cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.translate('Yes, Add Product'),
          handler: () => {
            this.OpenProductModelFromDialog();
          }
        }
      ]
    });
    await alert.present();
  }

  async presentUserNotFoundAlert() {
    const alert = await this.alertController.create({
      header: this.translateService.translate('Customer Not Found'),
      message: this.translateService.translate("There Is No Such Customer Exist, Would You Like To Add This Customer?"),
      buttons: [
        {
          text: this.translateService.translate('Cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.translate('Yes, Add Customer'),
          handler: () => {
            this.OpenUserModalFromDialog(null);
          }
        }
      ]
    });
    await alert.present();
  }

  clearBillingState() {
    this.SearchProduct = "";
    this.searchQuery = {};
    this.productSuggestions = [];
    this.userSuggestions = [];
    this.errorMessage = '';
    this.cartItems = [];
    this.totalPrice = 0;
    this.subtotalPrice = 0;
    this.taxPercent = 0;
    this.discountAmount = 0;
    this.discountType = 'amount';
    this.discountInput = 0;
    this.paymentType = 'Cash';
    this.scannedProduct = null;
    this.pendingAmountPaid = 0;
    this.pendingBalanceAmount = 0;
  }
}