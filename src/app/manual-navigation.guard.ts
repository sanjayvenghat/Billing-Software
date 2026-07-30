import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';

export const manualNavigationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const keysStorage = inject(KEYSSTORAGE);

  // If this is the initial load (e.g., page refresh or direct URL entry)
  if (!router.navigated) {
    const path = state.url.split('?')[0];
    const allowedEntryPaths = ['/', '/home', '/ResisterLogin', '/ForgotPassword', '/not-found'];

    if (!allowedEntryPaths.includes(path)) {
      const storedRoute = sessionStorage.getItem('currentRoute');

      // A navigation is a refresh if the requested URL matches the last successfully loaded URL
      const isRefresh = storedRoute && (state.url === storedRoute || path === storedRoute.split('?')[0]);

      if (!isRefresh) {
        router.navigate(['/not-found']);
        return false;
      }

      // Also ensure they have a valid session token
      const hasToken = keysStorage.hasItem('Token');
      if (!hasToken) {
        router.navigate(['/not-found']);
        return false;
      }
    }
  }

  return true;
};
