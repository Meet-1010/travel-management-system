// components/navbar/navbar.component.ts
// Redesigned sidebar — TMS brand theme

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="sidebar">

      <!-- Brand -->
      <div class="brand">
        <div class="brand-logo">
          <!-- SVG globe + plane — TMS logo inline -->
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
            <circle cx="50" cy="60" r="28" fill="none" stroke="#ff5c22" stroke-width="3"/>
            <ellipse cx="50" cy="60" rx="28" ry="12" fill="none" stroke="#ff5c22" stroke-width="2" opacity="0.5"/>
            <line x1="50" y1="32" x2="50" y2="88" stroke="#ff5c22" stroke-width="2" opacity="0.5"/>
            <line x1="22" y1="60" x2="78" y2="60" stroke="#ff5c22" stroke-width="2" opacity="0.5"/>
            <circle cx="50" cy="60" r="8" fill="#ff5c22" opacity="0.15"/>
            <!-- Plane -->
            <g transform="translate(54,35) rotate(-35)">
              <path d="M0 0 L14 5 L0 10 L3 5 Z" fill="#ff5c22"/>
              <path d="M2 5 L-6 1 L-5 5 L-6 9 Z" fill="#ff5c22" opacity="0.7"/>
            </g>
          </svg>
        </div>
        <div class="brand-text">
          <div class="brand-name">TravelMS</div>
          <div class="brand-tag">{{ auth.currentRole | titlecase }}</div>
        </div>
      </div>

      <!-- User Profile -->
      <div class="user-card">
        <div class="user-avatar">{{ getInitials() }}</div>
        <div class="user-info">
          <div class="user-name">{{ auth.getCurrentUser()?.name }}</div>
          <div class="user-email">{{ auth.getCurrentUser()?.email }}</div>
        </div>
      </div>

      <!-- Nav Section Label -->
      <div class="nav-section-label">Navigation</div>

      <!-- Links -->
      <ul class="nav-list">
        <li>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            <span>Dashboard</span>
          </a>
        </li>

        <li *ngIf="auth.isEmployee || auth.isManager || auth.isAdmin">
          <a routerLink="/travel-requests" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </span>
            <span>My Requests</span>
          </a>
        </li>

        <li *ngIf="auth.isEmployee || auth.isManager || auth.isAdmin">
          <a routerLink="/travel-requests/new" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </span>
            <span>New Request</span>
          </a>
        </li>

        <li *ngIf="auth.isManager || auth.isFinance || auth.isAdmin">
          <a routerLink="/approval-panel" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </span>
            <span>Approval Panel</span>
          </a>
        </li>

        <li *ngIf="auth.isAdmin || auth.isFinance || auth.isManager">
          <a routerLink="/reports" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
              </svg>
            </span>
            <span>Reports</span>
          </a>
        </li>

        <li *ngIf="auth.isAdmin">
          <a routerLink="/admin/policies" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </span>
            <span>Policies</span>
          </a>
        </li>

        <li *ngIf="auth.isAdmin">
          <a routerLink="/admin/users" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            <span>User Management</span>
          </a>
        </li>
      </ul>

      <!-- Logout -->
      <div class="sidebar-footer">
        <button class="logout-btn" (click)="auth.logout()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar {
      position: fixed; left: 0; top: 0; bottom: 0;
      width: 255px;
      background: #0a0a0a;
      border-right: 1px solid rgba(255,255,255,0.06);
      display: flex; flex-direction: column;
      padding: 0;
      z-index: 100;
      overflow: hidden;
    }

    /* Brand */
    .brand {
      display: flex; align-items: center; gap: 0.875rem;
      padding: 1.5rem 1.25rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .brand-logo {
      width: 40px; height: 40px; flex-shrink: 0;
    }
    .logo-svg { width: 100%; height: 100%; }
    .brand-name {
      font-family: 'Syne', sans-serif;
      font-size: 1.05rem; font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.01em;
    }
    .brand-tag {
      font-size: 0.65rem; font-weight: 600;
      color: #ff5c22;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 1px;
    }

    /* User card */
    .user-card {
      display: flex; align-items: center; gap: 0.75rem;
      margin: 1rem 1rem 0;
      padding: 0.75rem;
      background: rgba(255,92,34,0.06);
      border: 1px solid rgba(255,92,34,0.15);
      border-radius: 10px;
    }
    .user-avatar {
      width: 34px; height: 34px; flex-shrink: 0;
      border-radius: 8px;
      background: #ff5c22;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.8rem; color: #fff;
      font-family: 'Syne', sans-serif;
    }
    .user-name { font-size: 0.8rem; font-weight: 600; color: #f5f5f5; }
    .user-email { font-size: 0.68rem; color: #606060; margin-top: 1px; }

    /* Nav section */
    .nav-section-label {
      font-size: 0.65rem; font-weight: 700;
      color: #404040;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 1.25rem 1.25rem 0.5rem;
    }

    .nav-list { list-style: none; flex: 1; padding: 0 0.75rem; overflow-y: auto; }
    .nav-list li { margin-bottom: 2px; }

    .nav-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: 8px;
      color: #707070;
      text-decoration: none;
      font-size: 0.875rem; font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
    }
    .nav-item:hover {
      background: rgba(255,255,255,0.04);
      color: #d0d0d0;
    }
    .nav-item.active {
      background: rgba(255,92,34,0.12);
      color: #ff5c22;
      border: 1px solid rgba(255,92,34,0.2);
    }
    .nav-item.active .nav-icon { color: #ff5c22; }
    .nav-icon {
      display: flex; align-items: center; justify-content: center;
      width: 20px; flex-shrink: 0;
    }

    /* Footer */
    .sidebar-footer {
      padding: 1rem 1rem 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: auto;
    }
    .logout-btn {
      display: flex; align-items: center; gap: 0.625rem;
      width: 100%;
      padding: 0.625rem 0.875rem;
      background: transparent;
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 8px;
      color: #ef4444;
      font-size: 0.85rem; font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
    }
    .logout-btn:hover {
      background: rgba(239,68,68,0.1);
      border-color: rgba(239,68,68,0.4);
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}

  getInitials(): string {
    const name = this.auth.getCurrentUser()?.name || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
