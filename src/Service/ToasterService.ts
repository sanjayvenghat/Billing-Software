import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastItem {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'primary';
  duration: number;
  closing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastsSubject = new BehaviorSubject<ToastItem[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private counter = 0;

  // Generic method for full control
  showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'primary', duration: number = 2000) {
    const titles: Record<string, string> = {
      success: 'Success',
      danger: 'Error',
      warning: 'Warning',
      primary: 'Notification'
    };
    const item: ToastItem = {
      id: ++this.counter,
      title: titles[color] || 'Notification',
      message,
      type: color,
      duration: Math.max(1500, duration)
    };
    this.toastsSubject.next([...this.toastsSubject.value, item]);
    setTimeout(() => this.beginClose(item.id), item.duration + 350);
  }

  // Quick helper for Success
  async showSuccess(message: string) {
    this.showToast(message, 'success', 2500);
  }

  // Quick helper for Errors
  async showError(message: string) {
    this.showToast(message, 'danger', 3500); // Errors usually stay on screen a bit longer
  }

  // Quick helper for Warning
  async showWarning(message: string) {
    this.showToast(message, 'warning', 2500);
  }

  // Start the exit animation, then remove from the stack
  beginClose(id: number) {
    const current = this.toastsSubject.value;
    if (!current.some(t => t.id === id && !t.closing)) return;
    this.toastsSubject.next(current.map(t => t.id === id ? { ...t, closing: true } : t));
    setTimeout(() => this.remove(id), 280);
  }

  private remove(id: number) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}
