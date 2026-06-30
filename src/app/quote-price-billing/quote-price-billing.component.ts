import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, AnimationController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { QuotePriceComponent } from '../quote-price/quote-price.component';
@Component({
  selector: 'app-quote-price-billing',
  templateUrl: './quote-price-billing.component.html',
  styleUrls: ['./quote-price-billing.component.scss'],
  standalone: true,
  imports: [IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, QuotePriceComponent]
})
export class QuotePriceBillingComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  constructor(private animationCtrl: AnimationController) {
    addIcons({ close });
  }

  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0.8)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(300)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  ngOnInit() { }
}
