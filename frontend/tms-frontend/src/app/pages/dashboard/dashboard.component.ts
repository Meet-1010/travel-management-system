// pages/dashboard/dashboard.component.ts
// Redesigned dashboard — TMS brand theme

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TravelRequestService } from '../../services/travel-request.service';
import { TravelRequest } from '../../models/travel-request.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">

      <!-- Header -->
      <div class="dash-header">
        <div>
          <h1>Good {{ timeOfDay }}, <span class="name-accent">{{ getFirstName() }}</span></h1>
          <p>{{ getGreetingText() }}</p>
        </div>
        <a *ngIf="auth.isEmployee" routerLink="/travel-requests/new" class="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Request
        </a>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(255,92,34,0.1);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff5c22" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div class="stat-info">
            <div class="value" style="color:#ff5c22">{{ stats['total'] || 0 }}</div>
            <div class="label">Total Requests</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(56,189,248,0.1);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="stat-info">
            <div class="value" style="color:#38bdf8">{{ stats['submitted'] || 0 }}</div>
            <div class="label">Pending</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(34,197,94,0.1);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="stat-info">
            <div class="value" style="color:#22c55e">{{ stats['approved'] || 0 }}</div>
            <div class="label">Approved</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(239,68,68,0.1);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div class="stat-info">
            <div class="value" style="color:#ef4444">{{ stats['rejected'] || 0 }}</div>
            <div class="label">Rejected</div>
          </div>
        </div>
      </div>

      <!-- Bottom grid -->
      <div class="dash-grid">

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header-row">
            <h3>Quick Actions</h3>
          </div>
          <div class="actions-list">
            <a *ngIf="auth.isEmployee" routerLink="/travel-requests/new" class="action-row">
              <div class="action-icon brand">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div class="action-text">
                <div class="action-title">New Travel Request</div>
                <div class="action-sub">Submit a new corporate travel request</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>

            <a *ngIf="auth.isEmployee || auth.isAdmin" routerLink="/travel-requests" class="action-row">
              <div class="action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>
              <div class="action-text">
                <div class="action-title">View My Requests</div>
                <div class="action-sub">Track the status of your requests</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>

            <a *ngIf="auth.isManager || auth.isFinance || auth.isAdmin" routerLink="/approval-panel" class="action-row">
              <div class="action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div class="action-text">
                <div class="action-title">Approval Panel</div>
                <div class="action-sub">Review and approve pending requests</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>

            <a *ngIf="auth.isAdmin || auth.isFinance || auth.isManager" routerLink="/reports" class="action-row">
              <div class="action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div class="action-text">
                <div class="action-title">Reports</div>
                <div class="action-sub">View analytics and travel spend reports</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>

            <a *ngIf="auth.isAdmin" routerLink="/admin/users" class="action-row">
              <div class="action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="action-text">
                <div class="action-title">User Management</div>
                <div class="action-sub">Manage system users and roles</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <div class="card-header-row">
            <h3>Recent Activity</h3>
            <a routerLink="/travel-requests" class="btn btn-ghost btn-sm">View all</a>
          </div>

          <div *ngIf="loading" class="spinner"></div>

          <div *ngIf="!loading && recentRequests.length === 0" class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: #404040; margin-bottom: 0.75rem"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>No requests yet. Start by creating one!</p>
          </div>

          <div class="table-container" *ngIf="!loading && recentRequests.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Employee</th>
                  <th>Dates</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let req of recentRequests">
                  <td><strong>{{ req.destination }}</strong></td>
                  <td style="color: var(--text-secondary)">{{ req.employeeName }}</td>
                  <td style="color: var(--text-secondary)">{{ req.startDate | date:'MMM d' }} — {{ req.endDate | date:'MMM d, y' }}</td>
                  <td><strong>₹{{ req.budget | number }}</strong></td>
                  <td>
                    <span class="badge" [class]="'badge-' + req.status.toLowerCase()">
                      {{ formatStatus(req.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard { animation: fadeIn 0.35s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    .dash-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 2rem;
    }
    .dash-header h1 { font-size: 1.85rem; font-weight: 800; }
    .name-accent { color: var(--brand); }
    .dash-header p { color: var(--text-secondary); margin-top: 0.3rem; font-size: 0.9rem; }

    .dash-grid {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 1.25rem;
    }

    .card-header-row {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.25rem;
    }
    .card-header-row h3 { font-size: 0.95rem; font-weight: 700; }

    /* Quick actions */
    .actions-list { display: flex; flex-direction: column; gap: 2px; }
    .action-row {
      display: flex; align-items: center; gap: 0.875rem;
      padding: 0.875rem;
      border-radius: 10px;
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.2s;
      border: 1px solid transparent;
    }
    .action-row:hover {
      background: var(--bg-elevated);
      border-color: var(--border);
    }
    .action-row:hover .action-arrow { color: var(--brand); transform: translateX(3px); }
    .action-icon {
      width: 34px; height: 34px; flex-shrink: 0;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
    }
    .action-icon.brand { background: rgba(255,92,34,0.1); border-color: rgba(255,92,34,0.25); color: var(--brand); }
    .action-text { flex: 1; }
    .action-title { font-size: 0.875rem; font-weight: 600; }
    .action-sub { font-size: 0.75rem; color: var(--text-muted); margin-top: 1px; }
    .action-arrow { color: var(--text-muted); flex-shrink: 0; transition: all 0.2s; }

    /* Empty state */
    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 3rem 1rem; color: var(--text-muted); text-align: center;
    }
    .empty-state p { font-size: 0.875rem; }

    @media (max-width: 900px) {
      .dash-grid { grid-template-columns: 1fr; }
      .dash-header { flex-direction: column; gap: 1rem; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  recentRequests: TravelRequest[] = [];
  loading = true;
  timeOfDay = '';

  constructor(public auth: AuthService, private requestService: TravelRequestService) {
    const h = new Date().getHours();
    this.timeOfDay = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  }

  ngOnInit() {
    this.loadStats();
    this.loadRecentRequests();
  }

  loadStats() {
    this.requestService.getDashboardStats().subscribe({
      next: res => { if (res.success) this.stats = res.data; },
      error: () => {}
    });
  }

  loadRecentRequests() {
    const obs = this.auth.isEmployee
      ? this.requestService.getMyRequests()
      : this.requestService.getAllRequests();

    obs.subscribe({
      next: res => {
        if (res.success) this.recentRequests = res.data.slice(0, 6);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getGreetingText(): string {
    const role = this.auth.currentRole;
    if (role === 'EMPLOYEE') return 'Manage your travel requests and expenses from here.';
    if (role === 'MANAGER') return 'Review and approve pending travel requests.';
    if (role === 'FINANCE') return 'Process reimbursements and verify travel expenses.';
    return 'Full system overview and management.';
  }

  getFirstName(): string {
    const name = this.auth.getCurrentUser()?.name || '';
    return name.split(' ')[0] || name;
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }
}
