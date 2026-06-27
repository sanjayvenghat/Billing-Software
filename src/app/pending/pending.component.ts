import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonInput, IonTextarea, IonIcon, IonNote, AnimationController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, walletOutline, calendarOutline, chatbubbleEllipsesOutline, personOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonInput, IonTextarea, IonIcon, IonNote],
})
export class PendingComponent implements OnInit, OnChanges {

  @Input() isOpen: boolean = false;
  @Input() totalPrice: any = 0;
  @Input() customerName: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() confirmPending = new EventEmitter<{ amountPaid: number, balanceAmount: number, dueDate?: string, notes?: string }>();

  amountPaid: number = 0;
  balanceAmount: number = 0;
  dueDate: string = '';
  notes: string = '';

  constructor(private animationCtrl: AnimationController) {
    addIcons({
      'cash-outline': cashOutline,
      'wallet-outline': walletOutline,
      'calendar-outline': calendarOutline,
      'chatbubble-ellipses-outline': chatbubbleEllipsesOutline,
      'person-outline': personOutline,
      'alert-circle-outline': alertCircleOutline
    });
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

  ngOnInit() {
    this.balanceAmount = this.totalPrice;
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    this.dueDate = nextWeek.toISOString().substring(0, 10);
  }

  ngOnChanges() {
    this.updateBalance();
  }

  updateBalance() {
    this.balanceAmount = Math.max(0, this.totalPrice - (this.amountPaid || 0));
  }

  submitPending() {
    this.confirmPending.emit({
      amountPaid: this.amountPaid || 0,
      balanceAmount: this.balanceAmount,
      dueDate: this.dueDate,
      notes: this.notes
    });
    this.close.emit();
  }

}
