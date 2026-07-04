import { Component, OnInit } from '@angular/core';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { ProductService } from './product-service';
import { IonItem, IonLabel, IonList, IonNote, IonAvatar, IonListHeader, IonInput, IonButton, IonIcon, IonSearchbar, IonHeader, IonToolbar, IonContent, IonButtons, AlertController } from '@ionic/angular/standalone';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'src/Service/ToasterService';
import { addIcons } from 'ionicons';
import { createOutline, checkmarkOutline, closeOutline, funnel, trashOutline } from 'ionicons/icons';
import { LoaderService } from 'src/Service/LoaderService';
@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.scss'],
  imports: [IonItem, IonLabel, IonList, IonNote, IonAvatar, CurrencyPipe, IonListHeader, IonInput, IonButton, IonIcon, IonSearchbar, IonHeader, IonToolbar, IonContent, IonButtons, FormsModule, CommonModule],
})
export class ListProductComponent implements OnInit {
  Grocery_List: any = [];
  Filtered_Grocery_List: any = [];
  isAscending: boolean = true;
  searchQuery: string = '';

  constructor(
    private keysStorage: KEYSSTORAGE,
    private productService: ProductService,
    private toastService: ToastService,
    private alertController: AlertController,
    private LoaderService: LoaderService
  ) {
    addIcons({ createOutline, checkmarkOutline, closeOutline, funnel, trashOutline });
  }

  ngOnInit() {
    this.GetProductList();
  }
  GetProductList() {
    let companyId = this.keysStorage.getItem("CompanyId");
    this.productService.GetUserProducts(companyId).subscribe({
      next: (val: any) => {
        this.Grocery_List = val.GetUserProducts;
        this.Filtered_Grocery_List = [...this.Grocery_List];
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
    this.sortList();
  }

  toggleSort() {
    this.isAscending = !this.isAscending;
    this.sortList();
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

  editPrice(item: any) {
    item.isEditing = true;
    item.editSellingPrice = item.SellingPrice; // Create a temporary variable for editing
    item.editBuyingPrice = item.BuyingPrice; // Temporary variable for buying price editing
  }

  cancelEdit(item: any) {
    item.isEditing = false;
  }

  savePrice(item: any) {
    if (!item.editSellingPrice || isNaN(item.editSellingPrice) || !item.editBuyingPrice || isNaN(item.editBuyingPrice)) {
      this.toastService.showWarning("Please enter valid prices");
      return;
    }
    this.LoaderService.showLoader("The product Price Is Updating")
    this.productService.UpdateProductPrice(item._id, item.editSellingPrice, item.editBuyingPrice).subscribe({
      next: (val: any) => {
        this.LoaderService.hideLoader()
        item.SellingPrice = item.editSellingPrice;
        item.BuyingPrice = item.editBuyingPrice;
        item.isEditing = false;
        this.toastService.showSuccess("Prices updated successfully");
      },
      error: (err: any) => {
        this.LoaderService.hideLoader()
        console.error('Error updating price:', err);
        this.toastService.showError("Failed to update prices. Make sure backend route exists.");
      }
    });
  }

  async deleteProduct(item: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${item.ProductName}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Delete',
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
    this.LoaderService.showLoader("Product Is Deleting...")
    this.productService.DeleteProduct(item._id).subscribe({
      next: (val: any) => {
        this.LoaderService.hideLoader()
        this.Grocery_List = this.Grocery_List.filter((g: any) => g._id !== item._id);
        this.Filtered_Grocery_List = this.Filtered_Grocery_List.filter((g: any) => g._id !== item._id);
        this.toastService.showSuccess("Product deleted successfully");
      },
      error: (err: any) => {
        this.LoaderService.hideLoader()
        console.error('Error deleting product:', err);
        this.toastService.showError("Failed to delete product");
      }
    });
  }

  clearListState() {
    this.searchQuery = '';
    this.Filtered_Grocery_List = [...this.Grocery_List];
    this.sortList();
  }
}
