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
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent)
  },
  {
    path: 'GetUserDetails',
    loadComponent: () => import('./get-user-details/get-user-details.component').then((m) => m.GetUserDetailsComponent),
    children: [
      {
        path: 'billing',
        loadComponent: () => import('./billing/billing.component').then((m) => m.BillingComponent)
      },
      {
        path: 'quote-price',
        loadComponent: () => import('./quote-price/quote-price.component').then((m) => m.QuotePriceComponent)
      },
      {
        path: 'product-list',
        loadComponent: () => import('./list-product/list-product.component').then((m) => m.ListProductComponent),
      },
      {
        path: 'add-user',
        loadComponent: () => import('./create-user/create-user.component').then((m) => m.CreateUserComponent),

      },
      {
        path: 'pending',
        loadComponent: () => import('./ion-table/ion-table.component').then((m) => m.IonTableComponent)
      },
      {
        path: '',
        redirectTo: 'billing',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'not-found'
      }
    ]
  },

  {
    path: 'not-found',
    loadComponent: () => import('./no-result-found/no-result-found.component').then((m) => m.NoResultFoundComponent)
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
