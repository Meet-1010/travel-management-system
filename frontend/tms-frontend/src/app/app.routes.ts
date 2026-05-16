// app.routes.ts - Angular Router configuration

import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Public
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },

  // Protected routes (all require login)
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'travel-requests',
    loadComponent: () => import('./pages/travel-requests/travel-requests.component').then(m => m.TravelRequestsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'travel-requests/new',
    loadComponent: () => import('./pages/travel-request-form/travel-request-form.component').then(m => m.TravelRequestFormComponent),
    canActivate: [roleGuard('EMPLOYEE', 'MANAGER', 'ADMIN')]
  },
  {
    path: 'approval-panel',
    loadComponent: () => import('./pages/approval-panel/approval-panel.component').then(m => m.ApprovalPanelComponent),
    canActivate: [roleGuard('MANAGER', 'FINANCE', 'ADMIN')]
  },
  {
    path: 'expenses/:id',
    loadComponent: () => import('./pages/expenses/expenses.component').then(m => m.ExpensesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [roleGuard('ADMIN', 'FINANCE', 'MANAGER')]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [roleGuard('ADMIN')]
  },
  {
    path: 'admin/policies',
    loadComponent: () => import('./pages/policy-management/policy-management.component').then(m => m.PolicyManagementComponent),
    canActivate: [roleGuard('ADMIN')]
  },
  {
    path: 'itinerary/:id',
    loadComponent: () => import('./pages/itinerary/itinerary.component').then(m => m.ItineraryComponent),
    canActivate: [authGuard]
  },

  // Wildcard
  { path: '**', redirectTo: '/dashboard' }
];
