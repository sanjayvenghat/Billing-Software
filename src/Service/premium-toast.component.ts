import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle, alertCircle, informationCircle, close } from 'ionicons/icons';
import { ToastService } from './ToasterService';

@Component({
  selector: 'app-premium-toast',
  standalone: true,
  imports: [AsyncPipe, IonIcon],
  template: `
    <div class="premium-toast-viewport">
      @for (toast of toasts$ | async; track toast.id) {
      <div class="premium-toast" [class]="'toast-' + toast.type" [class.closing]="toast.closing">
        <div class="toast-icon">
          @if (toast.type === 'success') {
          <ion-icon name="checkmark-circle"></ion-icon>
          } @else if (toast.type === 'danger') {
          <ion-icon name="close-circle"></ion-icon>
          } @else if (toast.type === 'warning') {
          <ion-icon name="alert-circle"></ion-icon>
          } @else {
          <ion-icon name="information-circle"></ion-icon>
          }
        </div>
        <div class="toast-body">
          <span class="toast-title">{{ toast.title }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button class="toast-close" (click)="dismiss(toast.id)" aria-label="Dismiss">
          <ion-icon name="close"></ion-icon>
        </button>
        <span class="toast-progress" [style.animation-duration]="toast.duration + 'ms'"></span>
      </div>
      }
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 100000;
      display: flex;
      justify-content: center;
    }

    .premium-toast-viewport {
      position: absolute;
      top: 18px;
      width: calc(100% - 32px);
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .premium-toast {
      pointer-events: auto;
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 42px 14px 14px;
      border-radius: 16px;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow:
        0 12px 28px -8px rgba(15, 23, 42, 0.35),
        0 4px 14px -4px rgba(15, 23, 42, 0.25);
      overflow: hidden;
      animation: toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .premium-toast.closing {
      opacity: 0;
      transform: translateX(48px) scale(0.94);
    }

    .toast-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.22);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 23px;
    }

    .toast-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .toast-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.2px;
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(15, 23, 42, 0.15);
    }

    .toast-message {
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.94);
      word-break: break-word;
    }

    .toast-close {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(255, 255, 255, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 15px;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .toast-close:hover {
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
    }

    .toast-progress {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 3px;
      width: 100%;
      background: rgba(255, 255, 255, 0.55);
      transform-origin: left;
      animation: toast-progress linear forwards;
    }

    /* ---- Success ---- */
    .toast-success {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    /* ---- Danger ---- */
    .toast-danger {
      background: linear-gradient(135deg, #f43f5e, #dc2626);
    }

    /* ---- Warning ---- */
    .toast-warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    /* ---- Primary / Info ---- */
    .toast-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(-18px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes toast-progress {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }

    @media (min-width: 992px) {
      :host {
        justify-content: flex-end;
        padding-right: 24px;
      }

      .premium-toast-viewport {
        top: 24px;
        right: 0;
      }
    }
  `]
})
export class PremiumToastComponent {
  toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {
    addIcons({
      checkmarkCircle,
      closeCircle,
      alertCircle,
      informationCircle,
      close
    });
  }

  dismiss(id: number) {
    this.toastService.beginClose(id);
  }
}
