import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

/**
 * Guard to ensure only admins can access admin routes.
 * If a regular user or unauthenticated user tries to access, they are redirected to home.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user && user['role'] === 'admin') {
    return true;
  }

  return router.parseUrl('/home');
};

/**
 * Guard to ensure admins are redirected to the admin dashboard if they try to access e-commerce routes.
 * Also allows regular users and guests to access e-commerce.
 */
export const userGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user && user['role'] === 'admin') {
    return router.parseUrl('/admin');
  }

  return true;
};

/**
 * Guard to ensure only authenticated users can access specific routes.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};
