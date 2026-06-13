import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'ResisterLogin',
    loadComponent: () => import('./register-your-login/register-your-login.component').then((m) => m.RegisterYourLoginComponent)
  },
  {
    path: 'ForgotPassword',
    loadComponent: () => import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent)
  },
  {
    path: 'GetUserDetails',
    loadComponent: () => import('./get-user-details/get-user-details.component').then((m) => m.GetUserDetailsComponent)
  }
];
