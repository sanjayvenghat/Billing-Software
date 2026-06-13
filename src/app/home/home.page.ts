import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoginService } from './LoginService';
import { ToastService } from 'src/Service/ToasterService';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    CommonModule
  ],
})
export class HomePage implements OnInit {

  loginForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.fb.group({
      storename: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }



  // ─── Login ────────────────────────────────────────────────────────────
  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const payload = {
        storename: this.loginForm.value.storename,
        password: this.loginForm.value.password
      };

      console.log('Attempting login with:', payload);

      this.loginService.Login(payload).subscribe({
        next: (val: any) => {
          this.isLoading = false;

          if (val?.message === 'Login SuccessFul') {
            this.toastService.showSuccess(val.message);
            this.loginForm.reset();
            setTimeout(() => {
              this.router.navigate(['/GetUserDetails']);
            }, 1000);
          } else {
            this.toastService.showError(val?.message || 'Invalid store name or password.');
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Login error:', err);
          this.toastService.showError('Something went wrong. Please try again.');
        }
      });

    } else {
      this.loginForm.markAllAsTouched();
      if (this.loginForm.get('storename')?.invalid) {
        this.toastService.showToast('please enter valid Store Name', 'warning');
      } else {
        this.toastService.showError('Please fill all fields correctly.');
      }
    }
  }

  // ─── Forgot Password ───────────────────────────────────────────────────────
  onForgotPassword() {
    this.router.navigate(['/ForgotPassword']);
  }

  // ─── Navigate to Register ─────────────────────────────────────────────
  NavigateToRegister() {
    this.router.navigate(['/ResisterLogin']);
  }
}