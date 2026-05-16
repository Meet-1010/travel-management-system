// guards/auth.guard.ts
// Protects routes from unauthenticated/unauthorized access

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * authGuard - Route guard for authenticated users
 *
 * Applied to all protected routes.
 * If no token → redirect to /login
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

/**
 * roleGuard - Route guard for role-based access
 *
 * Returns a CanActivateFn that checks for specific roles.
 * Usage: canActivate: [roleGuard('ADMIN', 'MANAGER')]
 */
export const roleGuard = (...allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn) {
      router.navigate(['/login']);
      return false;
    }

    if (!allowedRoles.includes(authService.currentRole)) {
      router.navigate(['/dashboard']); // Redirect to dashboard if wrong role
      return false;
    }

    return true;
  };
};
