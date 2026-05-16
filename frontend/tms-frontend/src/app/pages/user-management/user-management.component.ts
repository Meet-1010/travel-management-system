// pages/user-management/user-management.component.ts
// Admin user management page

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="page-header">
        <h1>👥 User Management</h1>
        <p>Manage system users, roles and departments.</p>
      </div>

      <div class="grid-2">
        <!-- Create User Form -->
        <div class="card">
          <h3 class="mb-2">➕ Create New User</h3>
          <form (ngSubmit)="createUser()">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-control" [(ngModel)]="form.name" name="name" placeholder="John Doe" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" class="form-control" [(ngModel)]="form.email" name="email" placeholder="john@company.com" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control" [(ngModel)]="form.password" name="password" placeholder="Min 8 chars" required>
            </div>
            <div class="form-group">
              <label>Role</label>
              <select class="form-control" [(ngModel)]="form.role" name="role" required>
                <option value="">Select role</option>
                <option value="EMPLOYEE">👤 Employee</option>
                <option value="MANAGER">👔 Manager</option>
                <option value="FINANCE">💼 Finance Manager</option>
                <option value="ADMIN">🛡️ Admin</option>
              </select>
            </div>
            <div class="form-group">
              <label>Department</label>
              <input type="text" class="form-control" [(ngModel)]="form.department" name="department" placeholder="e.g., Sales, Engineering">
            </div>

            <div *ngIf="error" class="alert alert-error">{{ error }}</div>
            <div *ngIf="success" class="alert alert-success">{{ success }}</div>

            <button type="submit" class="btn btn-primary" [disabled]="creating">
              {{ creating ? '⏳ Creating...' : '➕ Create User' }}
            </button>
          </form>
        </div>

        <!-- User List -->
        <div class="card">
          <h3 class="mb-2">👥 All Users</h3>
          <div *ngIf="loadingUsers" class="spinner" style="margin: 1rem auto;"></div>
          <div class="user-list" *ngIf="!loadingUsers">
            <div *ngFor="let user of users" class="user-item">
              <div class="user-avatar-sm">{{ getInitials(user.name) }}</div>
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-meta">{{ user.email }} • {{ user.department || 'No dept' }}</div>
              </div>
              <span class="badge" [class]="getRoleBadge(user.role)">{{ user.role }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 450px; overflow-y: auto; }
    .user-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--bg-glass); border-radius: var(--radius-md); border: 1px solid var(--border); transition: var(--transition); }
    .user-item:hover { border-color: var(--border-hover); }
    .user-avatar-sm { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: white; flex-shrink: 0; }
    .user-info { flex: 1; }
    .user-name { font-weight: 600; font-size: 0.9rem; }
    .user-meta { font-size: 0.75rem; color: var(--text-muted); }
  `]
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  loadingUsers = true;
  creating = false;
  error = '';
  success = '';

  form = { name: '', email: '', password: '', role: '', department: '' };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: res => { if (res.success) this.users = res.data; this.loadingUsers = false; },
      error: () => { this.loadingUsers = false; }
    });
  }

  createUser() {
    this.creating = true;
    this.error = '';
    this.success = '';

    this.authService.register(this.form as any).subscribe({
      next: res => {
        if (res.success) {
          this.success = `✅ User ${this.form.name} created!`;
          this.form = { name: '', email: '', password: '', role: '', department: '' };
          this.loadUsers();
        }
        this.creating = false;
      },
      error: err => {
        this.error = err.error?.message || 'Failed to create user';
        this.creating = false;
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRoleBadge(role: string): string {
    const map: Record<string, string> = {
      'ADMIN': 'badge-rejected',
      'MANAGER': 'badge-submitted',
      'FINANCE': 'badge-manager_approved',
      'EMPLOYEE': 'badge-draft'
    };
    return map[role] || 'badge-draft';
  }
}
