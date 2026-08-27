import { Routes } from '@angular/router';
import { manualNavigationGuard } from './manual-navigation.guard';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then((m) => m.LandingComponent),
    pathMatch: 'full',
  },
  {
    path: 'about-us',
    loadComponent: () => import('./about-us/about-us.component').then((m) => m.AboutUsComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
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
    loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent),
    canActivate: [manualNavigationGuard]
  },
  {
    path: 'profit-report',
    loadComponent: () => import('./profit-report/profit-report.component').then((m) => m.ProfitReportComponent),
    canActivate: [manualNavigationGuard]
  },
  {
    path: 'EcommerceDashboard',
    loadComponent: () => import('./coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent),
    canActivate: [manualNavigationGuard],
    data: {
      title: 'E-Commerce Dashboard',
      description: 'We are building a powerful, real-time analytics suite to track your store orders, delivery updates, and customer shopping behavior. Stay tuned for a smarter e-commerce experience!',
      iconName: 'cart-outline'
    }
  },
  {
    path: 'DownloadApp',
    loadComponent: () => import('./coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent),
    data: {
      title: 'Download App',
      description: 'Our mobile application is currently under development. Soon you will be able to manage your store directly from your pocket!',
      iconName: 'download-outline'
    }
  },
  {
    path: 'GetUserDetails',
    loadComponent: () => import('./get-user-details/get-user-details.component').then((m) => m.GetUserDetailsComponent),
    canActivate: [manualNavigationGuard],
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
        redirectTo: '/not-found'
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
