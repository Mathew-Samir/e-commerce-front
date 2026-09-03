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
 * Guard to allow access to e-commerce routes for all users (including admins and guests).
 * Redirects unauthenticated users to the login page.
 */
export const userGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Allow access to auth-related pages without a token
  const publicPaths = ['/login', '/signup', '/change-password'];
  const targetUrl = state.url;
  const isPublicPage = publicPaths.some((path) => targetUrl.includes(path));

  if (isPublicPage) {
    return true;
  }

  // Redirect to login if no token exists
  if (!authService.getToken()) {
    return router.parseUrl('/login');
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
