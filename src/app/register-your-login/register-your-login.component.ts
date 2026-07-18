import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { RegisterService } from './RegisterService';
import { ToastService } from 'src/Service/ToasterService';
import { TranslatePipe } from '../../Service/TranslatePipe';
import { TranslateService } from '../../Service/TranslateService';

@Component({
  selector: 'app-register-your-login',
  templateUrl: './register-your-login.component.html',
  styleUrls: ['./register-your-login.component.scss'],
  imports: [
    IonicModule,
    ReactiveFormsModule,
    TranslatePipe
  ]
})
export class RegisterYourLoginComponent implements OnInit, OnDestroy {

  registerForm!: FormGroup;


  isOtpVisible: boolean = false;
  isOtpSent: boolean = false;
  isOtpVerified: boolean = false;
  resendCooldown: number = 0;
  IsloadingOtp: boolean = false;

  strengthValue: number = 0;
  strengthColor: string = 'danger';
  strengthLabel: string = '';

  private cooldownInterval: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService,
    private toastService: ToastService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy() {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  initForm() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      otp: ['', [Validators.minLength(6), Validators.maxLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // ─── Send OTP to Email ───────────────────────────────────────────────
  sendOtp() {
    const email = this.registerForm.get('email')?.value;

    if (!email || this.registerForm.get('email')?.invalid) {
      this.toastService.showError(this.translateService.translate('Please enter a valid email address.'));
      return;
    }
    this.IsloadingOtp = true;
    let payload = {
      email: email,
      Name: this.registerForm.get('name')?.value,
    }
    this.registerService.getOtp(payload).subscribe({
      next: (val: any) => {
        this.IsloadingOtp = false;
        if (val?.success || val?.message) {
          this.isOtpVisible = true;
          this.isOtpSent = true;
          this.toastService.showSuccess(this.translateService.translate('OTP sent to') + ' ' + email);
          this.startResendCooldown();
        } else {
          this.toastService.showError(this.translateService.translate('Failed to send OTP. Please try again.'));
        }
      },
      error: (err) => {
        console.error('OTP send error:', err);
        this.IsloadingOtp = false;
        this.toastService.showError(this.translateService.translate(err?.error?.message || 'Something went wrong. Please try again.'));
      }
    });
  }

  // ─── Verify OTP ──────────────────────────────────────────────────────
  verifyOtp() {
    const otp = this.registerForm.get('otp')?.value;
    const email = this.registerForm.get('email')?.value;
    if (!otp || String(otp).length !== 6) {
      this.toastService.showError(this.translateService.translate('Please enter the 6-digit OTP.'));
      return;
    }

    this.registerService.verifyOtp(email, otp).subscribe({
      next: (val: any) => {
        if (val?.message == 'OTP verified successfully') {
          this.isOtpVerified = true;
          this.toastService.showSuccess(this.translateService.translate('Email verified successfully!'));
        } else {
          this.isOtpVerified = false;
          this.toastService.showError(this.translateService.translate(val?.message || 'Invalid OTP. Please try again.'));
        }
      },
      error: (err: any) => {
        console.error('OTP verify error:', err);
        this.toastService.showError(this.translateService.translate('Verification failed. Please try again.'));
      }
    });
  }

  // ─── Resend OTP with Cooldown ─────────────────────────────────────────
  resendOtp() {
    if (this.resendCooldown > 0) return;
    this.isOtpSent = false;
    this.sendOtp();
  }

  startResendCooldown(seconds: number = 30) {
    this.resendCooldown = seconds;
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }

  checkPasswordStrength(event: any) {
    const password = event.target.value;

    if (!password) {
      this.strengthValue = 0;
      this.strengthLabel = '';
      return;
    }

    let strength = 0;

    // length
    if (password.length >= 6) {
      strength += 0.25;
    }
    if (password.length >= 8) {
      strength += 0.25;
    }
    // uppercase
    if (/[A-Z]/.test(password)) {
      strength += 0.25;
    }
    // numbers
    if (/[0-9]/.test(password)) {
      strength += 0.25;
    }
    // special characters
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 0.25;
    }

    this.strengthValue = Math.min(strength, 1);

    if (this.strengthValue <= 0.25) {
      this.strengthColor = 'danger';
      this.strengthLabel = 'Weak';
    } else if (this.strengthValue <= 0.5) {
      this.strengthColor = 'warning';
      this.strengthLabel = 'Fair';
    } else if (this.strengthValue <= 0.75) {
      this.strengthColor = 'primary';
      this.strengthLabel = 'Good';
    } else {
      this.strengthColor = 'success';
      this.strengthLabel = 'Strong';
    }
  }

  // ─── Register ────────────────────────────────────────────────────────
  onRegister() {
    if (!this.isOtpVerified) {
      this.toastService.showError(this.translateService.translate('Please verify your email before creating an account.'));
      return;
    }

    if (this.registerForm.valid) {
      const payload: any = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.registerService.Register(payload).subscribe({
        next: (val: any) => {
          if (val?.message === 'User Created SuccessFully') {
            this.toastService.showSuccess(this.translateService.translate(val.message));
            this.registerForm.reset();
            setTimeout(() => {
              this.goToLogin();
            }, 3000);
          } else {
            this.toastService.showError(this.translateService.translate(val?.message || 'Registration failed.'));
          }
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.toastService.showError(this.translateService.translate('Something went wrong. Please try again.'));
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
      this.toastService.showError(this.translateService.translate('Please fill all required fields correctly.'));
    }
  }

  // ─── Navigation ───────────────────────────────────────────────────────
  goToLogin() {
    this.router.navigate(['/home']);
  }
}