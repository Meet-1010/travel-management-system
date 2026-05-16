// app.config.ts - Angular application configuration (standalone API)

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

/**
 * ApplicationConfig - Angular 17+ Standalone API
 *
 * Why standalone? - No NgModule needed! Cleaner and more tree-shakeable.
 * provideHttpClient: enables Angular's HTTP client
 * withInterceptors: registers our JWT auth interceptor
 * provideRouter: enables client-side routing
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
