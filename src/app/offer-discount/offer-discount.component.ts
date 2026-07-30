import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowUndo,
  helpCircle,
  trash,
  pricetags,
  ticketOutline,
  giftOutline,
  cashOutline,
  informationCircleOutline,
  checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { DiscountService } from './discount-service';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { ProductService } from '../list-product/product-service';
import { TranslateService } from '../../Service/TranslateService';
import { TranslatePipe } from '../../Service/TranslatePipe';
import { ToastService } from 'src/Service/ToasterService';
import { LoaderService } from 'src/Service/LoaderService';

export interface Coupon {
  Code: string;
  Type: 'percentage' | 'flat';
  Value: number;
  MinPurchase: number;
  ExpireDate: string;
  Active: boolean;
}

export interface ProductDiscount {
  ProductId: string;
  ProductName: string;
  OriginalPrice: number;
  DiscountType: 'percentage' | 'flat';
  DiscountValue: number;
  DiscountedPrice: number;
}

@Component({
  selector: 'app-offer-discount',
  templateUrl: './offer-discount.component.html',
  styleUrls: ['./offer-discount.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonToggle,
    TranslatePipe
  ]
})
export class OfferDiscountComponent implements OnInit {
  currentTab: string = 'coupons'; // 'coupons' | 'products'
  IconType: string = 'Standard Black';

  iconsList = [
    { Icontype: 'FirstIcon', url: 'assets/icon/store.png' },
    { Icontype: 'SecondIcon', url: 'assets/icon/store (2).png' },
    { Icontype: 'ThirdIcon', url: 'assets/icon/store (3).png' },
    { Icontype: 'DefaultIcon', url: 'assets/icon/default.png' }
  ];

  // Coupon management states
  coupons: Coupon[] = [];
  newCoupon: Coupon = {
    Code: '',
    Type: 'percentage',
    Value: 0,
    MinPurchase: 0,
    ExpireDate: '',
    Active: true
  };

  // Product discount management states
  products: any[] = [];
  productDiscounts: ProductDiscount[] = [];
  selectedProductId: string = '';
  productDiscountType: 'percentage' | 'flat' = 'percentage';
  productDiscountValue: number = 0;

  constructor(
    private router: Router,
    private keysStorage: KEYSSTORAGE,
    private productService: ProductService,
    private translateService: TranslateService,
    private toastService: ToastService,
    private DiscountService: DiscountService,
    private loaderService: LoaderService
  ) {
    addIcons({
      'arrow-undo': arrowUndo,
      'help-circle': helpCircle,
      'trash': trash,
      'pricetags': pricetags,
      'ticket-outline': ticketOutline,
      'gift-outline': giftOutline,
      'cash-outline': cashOutline,
      'information-circle-outline': informationCircleOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline
    });
  }

  ngOnInit() {
    this.loadGeneralSettings();
    this.loadCoupons();
    this.loadProductDiscounts();
    this.loadProducts();
  }

  loadGeneralSettings() {
    const saved = this.keysStorage.getItem('APP_SETTINGS');
    if (saved) {
      this.IconType = saved.IconType || 'Standard Black';
    }
  }

  getSelectedIconUrl(): string {
    const selected = this.iconsList.find(item => item.Icontype === this.IconType);
    return selected ? selected.url : 'assets/icon/store.png';
  }

  goBackToApp() {
    this.router.navigate(['/GetUserDetails']);
  }

  // ─── Coupons Management ──────────────────────────────────────────────
  loadCoupons() {
    const saved = this.keysStorage.getItem('OFFER_COUPONS');
    if (saved && Array.isArray(saved)) {
      this.coupons = saved;
    } else {
      // Mock initial data
      this.coupons = [
        { Code: 'WELCOME10', Type: 'percentage', Value: 10, MinPurchase: 200, ExpireDate: '2026-12-31', Active: true },
        { Code: 'FESTIVE50', Type: 'flat', Value: 50, MinPurchase: 500, ExpireDate: '2026-09-30', Active: true },
        { Code: 'FRESH20', Type: 'percentage', Value: 20, MinPurchase: 300, ExpireDate: '2026-08-15', Active: false }
      ];
      this.keysStorage.setItem('OFFER_COUPONS', this.coupons);
    }
  }

  addCoupon() {
    if (!this.newCoupon.Code || this.newCoupon.Code.trim() === '') {
      this.toastService.showWarning(this.translateService.translate('Please enter coupon code'));
      return;
    }

    if (this.newCoupon.Value <= 0) {
      this.toastService.showWarning(this.translateService.translate('Please enter a valid discount value'));
      return;
    }

    // Force uppercase code
    const formattedCode = this.newCoupon.Code.trim().toUpperCase();

    // Check duplicate
    if (this.coupons.some(c => c.Code === formattedCode)) {
      this.toastService.showWarning(this.translateService.translate('Coupon code already exists'));
      return;
    }

    const couponToAdd: Coupon = {
      Code: formattedCode,
      Type: this.newCoupon.Type,
      Value: Number(this.newCoupon.Value),
      MinPurchase: Number(this.newCoupon.MinPurchase || 0),
      ExpireDate: this.newCoupon.ExpireDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      Active: this.newCoupon.Active
    };

    this.coupons.unshift(couponToAdd);
    this.keysStorage.setItem('OFFER_COUPONS', this.coupons);
    this.toastService.showSuccess(this.translateService.translate('Coupon added successfully!'));
    this.newCoupon = {
      Code: '',
      Type: 'percentage',
      Value: 0,
      MinPurchase: 0,
      ExpireDate: '',
      Active: true
    };
  }

  toggleCouponStatus(coupon: Coupon) {
    coupon.Active = !coupon.Active;
    this.keysStorage.setItem('OFFER_COUPONS', this.coupons);
    this.toastService.showSuccess(this.translateService.translate('Coupon status updated!'));
  }

  deleteCoupon(coupon: Coupon) {
    this.coupons = this.coupons.filter(c => c.Code !== coupon.Code);
    this.keysStorage.setItem('OFFER_COUPONS', this.coupons);
    this.toastService.showSuccess(this.translateService.translate('Coupon deleted successfully!'));
  }

  // ─── Product Discounts Management ───────────────────────────────────
  loadProducts() {
    const companyId = this.keysStorage.getItem("CompanyId");
    if (!companyId) return;

    this.productService.GetUserProducts(companyId).subscribe({
      next: (val: any) => {
        if (val && val.GetUserProducts) {
          this.products = val.GetUserProducts;
        }
      },
      error: (err: any) => {
        console.error('Error fetching products:', err);
      }
    });
  }

  loadProductDiscounts() {
    const saved = this.keysStorage.getItem('PRODUCT_DISCOUNTS');
    if (saved && Array.isArray(saved)) {
      this.productDiscounts = saved;
    } else {
      this.productDiscounts = [];
    }
  }

  applyProductDiscount() {
    console.log('applyProductDiscount() triggered');
    console.log('Selected Product ID:', this.selectedProductId);
    console.log('Discount Value:', this.productDiscountValue);
    console.log('Discount Type:', this.productDiscountType);
    console.log('Available Products:', this.products);

    if (!this.selectedProductId) {
      console.warn('applyProductDiscount: No product ID selected');
      this.toastService.showWarning(this.translateService.translate('Please select a product'));
      return;
    }
    if (this.productDiscountValue <= 0) {
      console.warn('applyProductDiscount: Invalid discount value (<= 0)');
      this.toastService.showWarning(this.translateService.translate('Please enter a valid discount value'));
      return;
    }
    const selectedProduct = this.products.find(p => p._id === this.selectedProductId);
    console.log('Found product matching ID:', selectedProduct);

    if (!selectedProduct) {
      console.error('applyProductDiscount: Selected product not found in the products array!');
      this.toastService.showError(this.translateService.translate('Selected product not found in local product list'));
      return;
    }
    const originalPrice = Number(selectedProduct.SellingPrice || 0);
    let discountedPrice = originalPrice;
    if (this.productDiscountType === 'percentage') {
      if (this.productDiscountValue > 100) {
        console.warn('applyProductDiscount: Percentage discount > 100%');
        this.toastService.showWarning(this.translateService.translate('Percentage discount cannot exceed 100%'));
        return;
      }
      discountedPrice = originalPrice - (originalPrice * (this.productDiscountValue / 100));
    } else {
      if (this.productDiscountValue > originalPrice) {
        console.warn('applyProductDiscount: Flat discount > selling price');
        this.toastService.showWarning(this.translateService.translate('Discount amount cannot exceed selling price'));
        return;
      }
      discountedPrice = originalPrice - this.productDiscountValue;
    }
    discountedPrice = Math.round(discountedPrice * 100) / 100;

    const discountToAdd: ProductDiscount = {
      ProductId: this.selectedProductId,
      ProductName: selectedProduct.ProductName,
      OriginalPrice: originalPrice,
      DiscountType: this.productDiscountType,
      DiscountValue: Number(this.productDiscountValue),
      DiscountedPrice: discountedPrice
    };

    console.log('Payload to send to API:', discountToAdd);

    this.loaderService.showLoader();
    this.DiscountService.ApplyProductDiscount(discountToAdd).subscribe({
      next: (val: any) => {
        console.log('ApplyProductDiscount API Success:', val);
        this.loaderService.hideLoader();
        this.productDiscounts = this.productDiscounts.filter(d => d.ProductId !== this.selectedProductId);
        this.productDiscounts.unshift(discountToAdd);
        this.keysStorage.setItem('PRODUCT_DISCOUNTS', this.productDiscounts);
        this.toastService.showSuccess(this.translateService.translate('Discount applied successfully!'));
        this.selectedProductId = '';
        this.productDiscountValue = 0;
      },
      error: (err: any) => {
        console.error('ApplyProductDiscount API Error:', err);
        this.loaderService.hideLoader();
        this.toastService.showError(this.translateService.translate(err?.error?.message || 'Failed to apply discount'));
      }
    });
  }

  removeProductDiscount(productId: string) {
    const discount = this.productDiscounts.find(d => d.ProductId === productId);
    if (!discount) return;

    this.loaderService.showLoader();
    this.DiscountService.ApplyProductDiscount({
      ProductId: productId,
      DiscountedPrice: discount.OriginalPrice
    }).subscribe({
      next: (val: any) => {
        this.loaderService.hideLoader();
        this.productDiscounts = this.productDiscounts.filter(d => d.ProductId !== productId);
        this.keysStorage.setItem('PRODUCT_DISCOUNTS', this.productDiscounts);
        this.toastService.showSuccess(this.translateService.translate('Discount removed successfully!'));
      },
      error: (err: any) => {
        this.loaderService.hideLoader();
        this.toastService.showError(this.translateService.translate(err?.error?.message || 'Failed to remove discount'));
      }
    });
  }

  // Helper metrics getters
  getActiveCouponsCount(): number {
    return this.coupons.filter(c => c.Active).length;
  }

  getActiveDiscountsCount(): number {
    return this.productDiscounts.length;
  }
}
