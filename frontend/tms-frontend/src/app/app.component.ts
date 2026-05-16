// app.component.ts - Root application shell

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    <div class="app-shell">
      <app-navbar *ngIf="authService.isLoggedIn"></app-navbar>
      <main class="page-content" [class.with-sidebar]="authService.isLoggedIn">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell { min-height: 100vh; background: var(--bg-base); }
    .page-content { transition: margin-left 0.3s ease; }
    .page-content.with-sidebar {
      margin-left: 255px;
      padding: 2rem 2.25rem;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
