import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoginService } from './LoginService';
import { ToastService } from 'src/Service/ToasterService';
import { LoaderService } from 'src/Service/LoaderService';
import { TranslatePipe } from '../../Service/TranslatePipe';
import { TranslateService } from '../../Service/TranslateService';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
})
export class HomePage implements OnInit {

  loginForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private translateService: TranslateService
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


  getSettingsForLogin() {
    this.loginService.getSettings().subscribe({
      next: (val: any) => {
        this.loaderService.hideLoader()
        this.isLoading = false;
        this.loaderService.hideLoader()
        if (val?.message === 'User Settings Get Successfully') {
          this.toastService.showSuccess(this.translateService.translate(val.message));
          this.loginForm.reset();
          if (val.userSettings && val.userSettings.darkMode) {
            document.documentElement.classList.add('ion-palette-dark');
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('ion-palette-dark');
            document.documentElement.classList.remove('dark');
          }
          setTimeout(() => {
            this.router.navigate(['/GetUserDetails']);
          }, 1000);
        } else {
          this.toastService.showWarning(this.translateService.translate(val?.message || 'Invalid store name or password.'));
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loaderService.hideLoader()
        console.error('Login error:', err);
        this.toastService.showError(this.translateService.translate('Something went wrong. Please try again.'));
      }
    })
  }
  // ─── Login ────────────────────────────────────────────────────────────
  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const payload = {
        storename: this.loginForm.value.storename,
        password: this.loginForm.value.password
      };

      this.loaderService.showLoader(this.translateService.translate("please wait..."))
      this.loginService.Login(payload).subscribe({
        next: (val: any) => {
          this.isLoading = false;
          if (val?.message === 'Login SuccessFul') {
            this.toastService.showSuccess(this.translateService.translate(val.message));
            this.getSettingsForLogin();
          } else {
            this.toastService.showWarning(this.translateService.translate(val?.message || 'Invalid store name or password.'));
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.loaderService.hideLoader()
          console.error('Login error:', err);
          this.toastService.showError(this.translateService.translate('Something went wrong. Please try again.'));
        }
      });

    } else {
      this.loginForm.markAllAsTouched();
      if (this.loginForm.get('storename')?.invalid) {
        this.toastService.showToast(this.translateService.translate('please enter valid Store Name'), 'warning');
      } else {
        this.toastService.showError(this.translateService.translate('Please fill all fields correctly.'));
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