// pages/reports/reports.component.ts
// Analytics and reporting for Admin/Finance/Manager

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelRequestService } from '../../services/travel-request.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="page-header">
        <h1>📈 Reports & Analytics</h1>
        <p>Corporate travel spend analytics, department-wise breakdown and audit logs.</p>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(99,102,241,0.15);">📋</div>
          <div class="stat-info">
            <div class="value">{{ stats['total'] || 0 }}</div>
            <div class="label">Total Requests</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16,185,129,0.15);">✅</div>
          <div class="stat-info">
            <div class="value" style="color: var(--success)">{{ stats['approved'] || 0 }}</div>
            <div class="label">Approved</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(14,165,233,0.15);">⏳</div>
          <div class="stat-info">
            <div class="value" style="color: var(--secondary)">{{ stats['submitted'] || 0 }}</div>
            <div class="label">Pending</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(239,68,68,0.15);">❌</div>
          <div class="stat-info">
            <div class="value" style="color: var(--danger)">{{ stats['rejected'] || 0 }}</div>
            <div class="label">Rejected</div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Department Spend -->
        <div class="card">
          <h3 class="mb-2">🏢 Department-wise Spend</h3>
          <div *ngIf="deptSpendLoading" class="spinner" style="margin: 1rem auto;"></div>
          <div *ngIf="!deptSpendLoading">
            <div *ngIf="deptSpendKeys.length === 0" class="text-muted text-center" style="padding: 1rem">
              No approved requests with budget data yet.
            </div>
            <div *ngFor="let dept of deptSpendKeys" class="dept-row">
              <div class="dept-info">
                <span class="dept-name">{{ dept }}</span>
                <span class="dept-amount">₹{{ deptSpend[dept] | number }}</span>
              </div>
              <div class="dept-bar">
                <div class="dept-fill" [style.width]="getBarWidth(deptSpend[dept]) + '%'"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit Logs (Admin only) -->
        <div class="card" *ngIf="auth.isAdmin">
          <h3 class="mb-2">📜 Recent Audit Logs</h3>
          <div *ngIf="logsLoading" class="spinner" style="margin: 1rem auto;"></div>
          <div class="logs-list" *ngIf="!logsLoading">
            <div *ngIf="auditLogs.length === 0" class="text-muted text-center" style="padding: 1rem">No audit logs yet.</div>
            <div *ngFor="let log of auditLogs.slice(0, 10)" class="log-item">
              <div class="log-action">{{ log.action }}</div>
              <div class="log-meta">{{ log.timestamp | date:'MMM d, y HH:mm' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dept-row { margin-bottom: 1rem; }
    .dept-info { display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem; }
    .dept-name { font-weight: 600; }
    .dept-amount { color: var(--primary-light); font-weight: 700; }
    .dept-bar { height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
    .dept-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 4px; transition: width 0.8s ease; }

    .logs-list { max-height: 380px; overflow-y: auto; }
    .log-item { padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
    .log-item:last-child { border-bottom: none; }
    .log-action { font-size: 0.85rem; color: var(--text-primary); }
    .log-meta { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem; }
  `]
})
export class ReportsComponent implements OnInit {
  stats: any = {};
  deptSpend: Record<string, number> = {};
  deptSpendKeys: string[] = [];
  auditLogs: any[] = [];
  deptSpendLoading = true;
  logsLoading = true;
  maxSpend = 0;

  constructor(private requestService: TravelRequestService, public auth: AuthService) {}

  ngOnInit() {
    this.requestService.getDashboardStats().subscribe(res => {
      if (res.success) this.stats = res.data;
    });
    this.requestService.getDepartmentSpend().subscribe(res => {
      if (res.success) {
        this.deptSpend = res.data;
        this.deptSpendKeys = Object.keys(res.data);
        this.maxSpend = Math.max(...Object.values(res.data) as number[]);
      }
      this.deptSpendLoading = false;
    });
    if (this.auth.isAdmin) {
      this.requestService.getAuditLogs().subscribe(res => {
        if (res.success) this.auditLogs = res.data;
        this.logsLoading = false;
      });
    } else { this.logsLoading = false; }
  }

  getBarWidth(amount: number): number {
    if (!this.maxSpend) return 0;
    return Math.round((amount / this.maxSpend) * 100);
  }
}
