import { Component, OnInit } from '@angular/core';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { ProductService } from './product-service';
import { IonItem, IonLabel, IonList, IonNote, IonAvatar, IonListHeader, IonInput, IonButton, IonIcon, IonSearchbar, IonHeader, IonToolbar, IonButtons, AlertController, IonModal, IonTitle, IonSelect, IonSelectOption, IonCheckbox, IonGrid, IonRow, IonCol, IonFooter, IonContent } from '@ionic/angular/standalone';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'src/Service/ToasterService';
import { addIcons } from 'ionicons';
import { createOutline, checkmarkOutline, closeOutline, funnel, trashOutline, addOutline, close, barcodeOutline, qrCodeOutline, downloadOutline, chevronBackOutline, chevronForwardOutline, cubeOutline, layersOutline } from 'ionicons/icons';
import { LoaderService } from 'src/Service/LoaderService';
import { TranslatePipe } from '../../Service/TranslatePipe';
import { TranslateService } from '../../Service/TranslateService';
import { QuotePriceComponent } from '../quote-price/quote-price.component';
import { CreateUserComponent } from '../create-user/create-user.component';
import { QRCodeComponent } from 'angularx-qrcode';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.scss'],
  imports: [IonItem, IonInput, IonButton, IonIcon, IonSearchbar, IonHeader, IonToolbar, IonButtons, IonModal, IonTitle, IonSelect, IonSelectOption, IonCheckbox, IonGrid, IonRow, IonCol, IonContent, FormsModule, CommonModule, TranslatePipe, QuotePriceComponent, CreateUserComponent, QRCodeComponent],
})
export class ListProductComponent implements OnInit {
  Grocery_List: any = [];
  Filtered_Grocery_List: any = [];
  isAscending: boolean = true;
  searchQuery: string = '';
  showProfitOfEveryProduct: boolean = true;
  isAddModalOpen: boolean = false;
  isAddUserModalOpen: boolean = false;
  isQrModalOpen: boolean = false;
  selectedQrProduct: any = null;
  qrUrl: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  isEditModalOpen: boolean = false;
  editItem: any = {};
  editEnableGst: boolean = false;
  editGstRate: number = 5;
  gstRates: number[] = [0, 0.25, 3, 5, 12, 18, 28];

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.Filtered_Grocery_List.length / this.itemsPerPage));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedProducts(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.Filtered_Grocery_List.slice(start, start + this.itemsPerPage);
  }

  constructor(
    private keysStorage: KEYSSTORAGE,
    private productService: ProductService,
    private toastService: ToastService,
    private alertController: AlertController,
    private LoaderService: LoaderService,
    private translateService: TranslateService
  ) {
    addIcons({ createOutline, checkmarkOutline, closeOutline, funnel, trashOutline, addOutline, close, barcodeOutline, qrCodeOutline, downloadOutline, chevronBackOutline, chevronForwardOutline, 'cube-outline': cubeOutline, 'layers-outline': layersOutline });
    this.Grocery_List = [];
    this.Filtered_Grocery_List = [];
  }

  ngOnInit() {
    this.loadSettings();
    this.GetProductList();
  }

  loadSettings() {
    const saved = this.keysStorage.getItem('APP_SETTINGS');
    if (saved) {
      this.showProfitOfEveryProduct = saved.showProfitOfEveryProduct ?? true;
    } else {
      this.showProfitOfEveryProduct = true;
    }
  }
  GetProductList() {
    let companyId = this.keysStorage.getItem("CompanyId");
    this.productService.GetUserProducts(companyId).subscribe({
      next: (val: any) => {
        this.Grocery_List = val.GetUserProducts;
        this.Filtered_Grocery_List = [...this.Grocery_List];
        this.currentPage = 1;
        this.sortList();
      },
      error: (err: any) => {
        console.error('Error fetching grocery data:', err);
      }
    });

  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.Filtered_Grocery_List = this.Grocery_List.filter((item: any) => {
      return item.ProductName && item.ProductName.toLowerCase().includes(query);
    });
    this.currentPage = 1;
    this.sortList();
  }

  toggleSort() {
    this.isAscending = !this.isAscending;
    this.currentPage = 1;
    this.sortList();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  sortList() {
    this.Filtered_Grocery_List.sort((a: any, b: any) => {
      const nameA = a.ProductName ? a.ProductName.toLowerCase() : '';
      const nameB = b.ProductName ? b.ProductName.toLowerCase() : '';
      if (nameA < nameB) return this.isAscending ? -1 : 1;
      if (nameA > nameB) return this.isAscending ? 1 : -1;
      return 0;
    });
  }

  openEditModal(item: any) {
    this.editItem = {
      _id: item._id,
      ProductName: item.ProductName || '',
      SellingPrice: item.SellingPrice ?? '',
      BuyingPrice: item.BuyingPrice ?? '',
      unit: item.unit || item.Unit || 'Piece',
      ItemCode: item.ItemCode || '',
      Stock: item.Stock || 0
    };
    this.editEnableGst = Number(item.GST) > 0;
    this.editGstRate = Number(item.GST) || 5;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editItem = {};
  }

  saveProduct() {
    const payload = {
      ProductName: this.editItem.ProductName,
      SellingPrice: this.editItem.SellingPrice,
      BuyingPrice: this.editItem.BuyingPrice,
      Unit: this.editItem.unit,
      ItemCode: this.editItem.ItemCode,
      GST: this.editEnableGst ? this.editGstRate : 0,
      Stock: this.editItem.Stock || 0
    };
    if (!payload.ProductName || payload.SellingPrice === '' || payload.SellingPrice === undefined || isNaN(payload.SellingPrice) || payload.BuyingPrice === '' || payload.BuyingPrice === undefined || isNaN(payload.BuyingPrice) || !payload.Unit) {
      this.toastService.showWarning(this.translateService.translate("Please enter valid product name, prices and unit"));
      return;
    }
    this.LoaderService.showLoader(this.translateService.translate("Updating product..."));
    this.productService.UpdateProduct(this.editItem._id, payload).subscribe({
      next: (val: any) => {
        this.LoaderService.hideLoader();
        this.closeEditModal();
        this.GetProductList();
        this.toastService.showSuccess(this.translateService.translate("Product updated successfully"));
      },
      error: (err: any) => {
        this.LoaderService.hideLoader();
        console.error('Error updating product:', err);
        this.toastService.showError(this.translateService.translate("Failed to update product. Make sure backend route exists."));
      }
    });
  }

  async deleteProduct(item: any) {
    const alert = await this.alertController.create({
      header: this.translateService.translate('Confirm Delete'),
      message: this.translateService.translate('Are you sure you want to delete') + ` "${item.ProductName}"?`,
      buttons: [
        {
          text: this.translateService.translate('Cancel'),
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: this.translateService.translate('Delete'),
          role: 'destructive',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.confirmDelete(item);
          }
        }
      ]
    });

    await alert.present();
  }

  private confirmDelete(item: any) {
    this.LoaderService.showLoader(this.translateService.translate("Product Is Deleting..."))
    this.productService.DeleteProduct(item._id).subscribe({
      next: (val: any) => {
        this.LoaderService.hideLoader()
        this.Grocery_List = this.Grocery_List.filter((g: any) => g._id !== item._id);
        this.Filtered_Grocery_List = this.Filtered_Grocery_List.filter((g: any) => g._id !== item._id);
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
        this.toastService.showSuccess(this.translateService.translate("Product deleted successfully"));
      },
      error: (err: any) => {
        this.LoaderService.hideLoader()
        console.error('Error deleting product:', err);
        this.toastService.showError(this.translateService.translate("Failed to delete product"));
      }
    });
  }

  openQrModal(item: any) {
    this.selectedQrProduct = item;
    this.qrUrl = `${environment.LoginUrl}/view-item/getItem?id=${item._id}`;
    this.isQrModalOpen = true;
  }

  closeQrModal() {
    this.isQrModalOpen = false;
    this.selectedQrProduct = null;
    this.qrUrl = '';
  }

  downloadQR() {
    const canvas = document.querySelector('canvas');

    if (canvas) {
      const url = canvas.toDataURL('image/png');

      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.selectedQrProduct?.ProductName || 'product'}-qrcode.png`;
      a.click();
    }
  }

  clearListState() {
    this.searchQuery = '';
    this.Filtered_Grocery_List = [...this.Grocery_List];
    this.currentPage = 1;
    this.sortList();
  }
}
