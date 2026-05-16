// interceptors/auth.interceptor.ts
// Automatically attaches the JWT token to every HTTP request

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * authInterceptor - Functional HTTP Interceptor (Angular 17+ style)
 *
 * Why? Without this, we'd have to manually add the Authorization header
 * to every single API call. The interceptor does it automatically.
 *
 * Flow:
 * 1. HTTP request is made by any service
 * 2. This interceptor adds "Authorization: Bearer <token>"
 * 3. Spring Boot JwtAuthFilter extracts and validates the token
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }

  return next(req);
};
