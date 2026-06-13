import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ForgotPasswordService } from './ForgotPasswordService';
import { ToastService } from 'src/Service/ToasterService';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  forgotForm!: FormGroup;

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
    private forgotPasswordService: ForgotPasswordService,
    private toastService: ToastService
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
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      otp: ['', [Validators.minLength(6), Validators.maxLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  // ─── Send OTP to Email ───────────────────────────────────────────────
  sendOtp() {
    const emailControl = this.forgotForm.get('email');
    if (!emailControl || emailControl.invalid) {
      this.forgotForm.markAllAsTouched();
      this.toastService.showToast('please enter valid Email', 'warning');
      return;
    }
    
    this.IsloadingOtp = true;
    let payload = {
      email: emailControl.value,
      Name: 'User', // Placeholder since we only have email
    }
    
    this.forgotPasswordService.getOtp(payload).subscribe({
      next: (val: any) => {
        this.IsloadingOtp = false;
        if (val?.success || val?.message) {
          this.isOtpVisible = true;
          this.isOtpSent = true;
          this.toastService.showSuccess('OTP sent to ' + emailControl.value);
          this.startResendCooldown();
        } else {
          this.toastService.showError('Failed to send OTP. Please try again.');
        }
      },
      error: (err) => {
        console.error('OTP send error:', err);
        this.IsloadingOtp = false;
        this.toastService.showError(err?.error?.message || 'Something went wrong. Please try again.');
      }
    });
  }

  // ─── Verify OTP ──────────────────────────────────────────────────────
  verifyOtp() {
    const otp = this.forgotForm.get('otp')?.value;
    const email = this.forgotForm.get('email')?.value;

    if (!otp || String(otp).length !== 6) {
      this.toastService.showError('Please enter the 6-digit OTP.');
      return;
    }

    this.forgotPasswordService.verifyOtp(email, otp).subscribe({
      next: (val: any) => {
        if (val?.message == 'OTP verified successfully') {
          this.isOtpVerified = true;
          this.toastService.showSuccess('Email verified successfully! You can now set your new password.');
        } else {
          this.isOtpVerified = false;
          this.toastService.showError(val?.message || 'Invalid OTP. Please try again.');
        }
      },
      error: (err: any) => {
        console.error('OTP verify error:', err);
        this.toastService.showError('Verification failed. Please try again.');
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

  // ─── Reset Password ──────────────────────────────────────────────────
  onResetPassword() {
    if (!this.isOtpVerified) {
      this.toastService.showError('Please verify your email before resetting your password.');
      return;
    }

    if (this.forgotForm.valid) {
      const payload: any = {
        email: this.forgotForm.value.email,
        password: this.forgotForm.value.password
      };
      
      this.forgotPasswordService.resetPassword(payload).subscribe({
        next: (val: any) => {
          this.toastService.showSuccess(val?.message || 'Password reset successfully!');
          setTimeout(() => {
            this.goToLogin();
          }, 2000);
        },
        error: (err) => {
          console.error('Reset Password error:', err);
          this.toastService.showError('Something went wrong resetting your password. Please try again.');
        }
      });

    } else {
      this.forgotForm.markAllAsTouched();
      this.toastService.showError('Please fill all required fields correctly.');
    }
  }

  // ─── Navigation ───────────────────────────────────────────────────────
  goToLogin() {
    this.router.navigate(['/home']);
  }
}
