// pages/login/login.component.ts
// Premium login — TMS brand theme

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-root">

      <!-- Left panel: visual brand -->
      <div class="login-left">
        <div class="login-left-inner">
          <!-- Animated rings -->
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>

          <!-- Logo mark -->
          <div class="hero-logo">
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="hero-svg">
              <circle cx="60" cy="70" r="36" fill="none" stroke="rgba(255,92,34,0.6)" stroke-width="2.5"/>
              <ellipse cx="60" cy="70" rx="36" ry="15" fill="none" stroke="rgba(255,92,34,0.35)" stroke-width="2"/>
              <line x1="60" y1="34" x2="60" y2="106" stroke="rgba(255,92,34,0.3)" stroke-width="1.5"/>
              <line x1="24" y1="70" x2="96" y2="70" stroke="rgba(255,92,34,0.3)" stroke-width="1.5"/>
              <!-- Plane -->
              <g transform="translate(68,42) rotate(-40)">
                <path d="M0 0 L18 6 L0 12 L4 6 Z" fill="#ff5c22"/>
                <path d="M3 6 L-8 2 L-7 6 L-8 10 Z" fill="#ff5c22" opacity="0.6"/>
              </g>
              <!-- Orbit path -->
              <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke="rgba(255,92,34,0.15)" stroke-width="1" transform="rotate(-20 60 60)"/>
            </svg>
          </div>

          <div class="hero-content">
            <h1 class="hero-title">Corporate<br><span>Travel.</span><br>Simplified.</h1>
            <p class="hero-sub">Manage requests, approvals, and expenses — all in one streamlined platform.</p>
          </div>

          <div class="hero-stats">
            <div class="h-stat"><div class="h-stat-val">500+</div><div class="h-stat-label">Requests Managed</div></div>
            <div class="h-divider"></div>
            <div class="h-stat"><div class="h-stat-val">4</div><div class="h-stat-label">User Roles</div></div>
            <div class="h-divider"></div>
            <div class="h-stat"><div class="h-stat-val">100%</div><div class="h-stat-label">Paperless</div></div>
          </div>
        </div>
      </div>

      <!-- Right panel: form -->
      <div class="login-right">
        <div class="form-card">

          <!-- Header -->
          <div class="form-header">
            <div class="form-logo-row">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                <circle cx="20" cy="23" r="12" fill="none" stroke="#ff5c22" stroke-width="2"/>
                <ellipse cx="20" cy="23" rx="12" ry="5" fill="none" stroke="#ff5c22" stroke-width="1.5" opacity="0.5"/>
                <g transform="translate(23,14) rotate(-35)">
                  <path d="M0 0 L7 2.5 L0 5 L1.5 2.5 Z" fill="#ff5c22"/>
                  <path d="M1 2.5 L-3 1 L-2.5 2.5 L-3 4 Z" fill="#ff5c22" opacity="0.6"/>
                </g>
              </svg>
              <span class="form-brand">TravelMS</span>
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <!-- Form -->
          <form (ngSubmit)="login()" class="auth-form">
            <div class="form-group">
              <label for="email-input">Email Address</label>
              <div class="input-wrap">
                <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input id="email-input" type="email" class="form-control with-icon" [(ngModel)]="email" name="email"
                  placeholder="you@company.com" required autocomplete="email">
              </div>
            </div>

            <div class="form-group">
              <label for="password-input">Password</label>
              <div class="input-wrap">
                <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input id="password-input" type="password" class="form-control with-icon" [(ngModel)]="password" name="password"
                  placeholder="••••••••" required autocomplete="current-password">
              </div>
            </div>

            <div *ngIf="error" class="alert alert-error">{{ error }}</div>

            <button type="submit" class="btn btn-primary btn-lg sign-in-btn" [disabled]="loading">
              <span *ngIf="loading" class="btn-spinner"></span>
              <span *ngIf="!loading">
                Sign In
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
              <span *ngIf="loading">Signing in...</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-root {
      min-height: 100vh;
      display: flex;
      background: #030303;
    }

    /* --- LEFT PANEL --- */
    .login-left {
      flex: 1;
      background: linear-gradient(135deg, #0d0d0d 0%, #0f0a08 60%, #150d09 100%);
      border-right: 1px solid rgba(255,92,34,0.1);
      display: flex; align-items: center; justify-content: center;
      padding: 3rem;
      position: relative;
      overflow: hidden;
    }

    /* Decorative rings */
    .ring {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(255,92,34,0.08);
    }
    .ring-1 { width: 600px; height: 600px; top: 50%; left: 50%; transform: translate(-50%,-50%); }
    .ring-2 { width: 400px; height: 400px; top: 50%; left: 50%; transform: translate(-50%,-50%); }
    .ring-3 { width: 200px; height: 200px; top: 50%; left: 50%; transform: translate(-50%,-50%); border-color: rgba(255,92,34,0.15); }

    .login-left-inner {
      position: relative; z-index: 1;
      display: flex; flex-direction: column; align-items: center;
      text-align: center; max-width: 380px;
    }

    .hero-svg { width: 140px; height: 140px; margin-bottom: 2rem; filter: drop-shadow(0 0 30px rgba(255,92,34,0.3)); }

    .hero-title {
      font-family: 'Syne', sans-serif;
      font-size: 3.25rem; font-weight: 800;
      color: #f5f5f5;
      line-height: 1.05;
      letter-spacing: -0.03em;
      margin-bottom: 1rem;
    }
    .hero-title span { color: #ff5c22; }

    .hero-sub {
      color: #606060;
      font-size: 0.95rem;
      line-height: 1.65;
      margin-bottom: 2.5rem;
    }

    .hero-stats {
      display: flex; align-items: center; gap: 1.5rem;
      padding: 1.25rem 1.75rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
    }
    .h-stat { text-align: center; }
    .h-stat-val { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; color: #ff5c22; }
    .h-stat-label { font-size: 0.7rem; color: #505050; margin-top: 2px; }
    .h-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.07); }

    /* --- RIGHT PANEL --- */
    .login-right {
      width: 480px;
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
      background: #080808;
    }

    .form-card {
      width: 100%; max-width: 400px;
    }

    .form-header { margin-bottom: 2rem; }
    .form-logo-row {
      display: flex; align-items: center; gap: 0.625rem;
      margin-bottom: 1.75rem;
    }
    .form-brand {
      font-family: 'Syne', sans-serif;
      font-size: 1rem; font-weight: 800;
      color: #ffffff;
    }
    .form-header h2 {
      font-size: 1.6rem; font-weight: 800;
      color: #ffffff; margin-bottom: 0.35rem;
      font-family: 'Syne', sans-serif;
    }
    .form-header p { color: #606060; font-size: 0.875rem; }

    /* Quick roles */
    .quick-roles {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.75rem;
    }
    .qr-label { font-size: 0.68rem; font-weight: 700; color: #505050; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.625rem; }
    .qr-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.625rem; }
    .qr-btn {
      padding: 0.5rem 0.25rem;
      background: #141414;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 7px;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .qr-btn:hover, .qr-btn.active {
      background: rgba(255,92,34,0.1);
      border-color: rgba(255,92,34,0.35);
    }
    .qr-role { font-size: 0.72rem; font-weight: 700; color: #a0a0a0; display: block; }
    .qr-btn:hover .qr-role, .qr-btn.active .qr-role { color: #ff5c22; }
    .qr-hint { font-size: 0.72rem; color: #505050; }
    .qr-hint strong { color: #a0a0a0; }

    /* Form */
    .auth-form { display: flex; flex-direction: column; gap: 0; }

    .input-wrap { position: relative; }
    .input-icon {
      position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
      color: #505050; pointer-events: none;
    }
    .form-control.with-icon { padding-left: 2.6rem; }

    .sign-in-btn {
      width: 100%;
      justify-content: center;
      margin-top: 0.5rem;
      gap: 0.5rem;
      font-size: 0.9rem;
      letter-spacing: 0.01em;
    }

    .btn-spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Responsive */
    @media (max-width: 900px) {
      .login-left { display: none; }
      .login-right { width: 100%; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) this.router.navigate(['/dashboard']);
  }

  login() {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        if (res.success) this.router.navigate(['/dashboard']);
        else this.error = res.message;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid email or password';
        this.loading = false;
      }
    });
  }
}
