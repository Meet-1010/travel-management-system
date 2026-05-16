// pages/approval-panel/approval-panel.component.ts
// Approval workflow interface for Manager, Finance, and Admin

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TravelRequestService } from '../../services/travel-request.service';
import { TravelRequest } from '../../models/travel-request.model';

@Component({
  selector: 'app-approval-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div>
      <div class="page-header">
        <h1>{{ panelTitle }}</h1>
        <p>{{ panelSubtitle }}</p>
      </div>

      <!-- Workflow Diagram -->
      <div class="workflow-banner">
        <div class="wf-step" [class.active]="true">📝 Employee/Manager Submits</div>
        <div class="wf-arrow">→</div>
        <div class="wf-step" [class.active]="auth.isManager">✅ Manager Approves</div>
        <div class="wf-arrow">→</div>
        <div class="wf-step" [class.active]="auth.isFinance">💼 Finance Approves</div>
        <div class="wf-arrow">→</div>
        <div class="wf-step">🎉 Approved</div>
      </div>

      <!-- Manager Queue -->
      <div *ngIf="auth.isManager || auth.isAdmin">
        <div class="queue-header">
          <h3>🔵 Manager Queue <span class="count-badge">{{ managerQueue.length }}</span></h3>
          <p class="text-muted">SUBMITTED requests waiting for your approval</p>
        </div>

        <div *ngIf="loadingManager" class="spinner"></div>

        <div *ngIf="!loadingManager && managerQueue.length === 0" class="empty-state">
          <div class="empty-icon">🎉</div>
          <p>No pending requests in your queue</p>
        </div>

        <div class="approval-grid" *ngIf="!loadingManager && managerQueue.length > 0">
          <div class="approval-card card" *ngFor="let req of managerQueue">
            <ng-container *ngTemplateOutlet="requestCard; context: {req: req, queueType: 'manager'}"></ng-container>
          </div>
        </div>
      </div>

      <!-- Finance Queue -->
      <div [class.mt-3]="auth.isAdmin" *ngIf="auth.isFinance || auth.isAdmin">
        <div class="queue-header">
          <h3>🟡 Finance Queue <span class="count-badge finance">{{ financeQueue.length }}</span></h3>
          <p class="text-muted">MANAGER_APPROVED requests waiting for final Finance approval</p>
        </div>

        <div *ngIf="loadingFinance" class="spinner"></div>

        <div *ngIf="!loadingFinance && financeQueue.length === 0" class="empty-state">
          <div class="empty-icon">🎉</div>
          <p>No pending requests in Finance queue</p>
        </div>

        <div class="approval-grid" *ngIf="!loadingFinance && financeQueue.length > 0">
          <div class="approval-card card" *ngFor="let req of financeQueue">
            <ng-container *ngTemplateOutlet="requestCard; context: {req: req, queueType: 'finance'}"></ng-container>
          </div>
        </div>
      </div>

      <!-- Reusable Request Card Template -->
      <ng-template #requestCard let-req="req" let-queueType="queueType">
        <div class="ap-header">
          <div>
            <h4>✈️ {{ req.destination }}</h4>
            <div class="text-muted" style="font-size: 0.8rem">
              Request #{{ req.id }} • by {{ req.employeeName }}
            </div>
          </div>
          <span class="badge" [class]="'badge-' + req.status.toLowerCase()">
            {{ req.status.replace('_', ' ') }}
          </span>
        </div>

        <div class="ap-info">
          <div class="info-row">
            <span>👤 Submitted by:</span>
            <strong>{{ req.employeeName }} ({{ req.department || 'N/A' }})</strong>
          </div>
          <div class="info-row">
            <span>📅 Travel:</span>
            <strong>{{ req.startDate | date:'MMM d' }} → {{ req.endDate | date:'MMM d, y' }}</strong>
          </div>
          <div class="info-row">
            <span>💰 Budget:</span>
            <strong [class.over-budget]="req.budget > 50000">
              ₹{{ req.budget | number }}
              <span *ngIf="req.budget > 50000" class="badge badge-rejected" style="font-size:0.65rem; padding: 2px 6px">⚠️ Over Policy</span>
            </strong>
          </div>
          <div class="info-row">
            <span>📝 Purpose:</span>
            <span class="text-muted">{{ req.purpose | slice:0:80 }}{{ req.purpose.length > 80 ? '...' : '' }}</span>
          </div>
        </div>

        <!-- Approval action UI -->
        <div class="approval-action" *ngIf="!getState(req.id, queueType).done">
          <textarea class="form-control" [(ngModel)]="getState(req.id, queueType).comments" rows="2"
                    [placeholder]="queueType === 'manager' ? 'Manager comment (optional)...' : 'Finance comment (optional)...'"></textarea>
          <div class="flex gap-1 mt-1">
            <button class="btn btn-success" (click)="decide(req.id, 'APPROVED', queueType)"
                    [disabled]="getState(req.id, queueType).loading">
              {{ getState(req.id, queueType).loading ? '⏳' : '✅' }} Approve
            </button>
            <button class="btn btn-danger" (click)="decide(req.id, 'REJECTED', queueType)"
                    [disabled]="getState(req.id, queueType).loading">
              {{ getState(req.id, queueType).loading ? '⏳' : '❌' }} Reject
            </button>
          </div>
        </div>

        <!-- Done state -->
        <div *ngIf="getState(req.id, queueType).done" class="alert mt-1"
             [class]="getState(req.id, queueType).result === 'APPROVED' ? 'alert-success' : 'alert-error'">
          {{ getState(req.id, queueType).result === 'APPROVED' ? '✅ Approved!' : '❌ Rejected!' }}
        </div>

        <!-- Error state -->
        <div *ngIf="getState(req.id, queueType).error" class="alert alert-error mt-1">
          {{ getState(req.id, queueType).error }}
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .workflow-banner {
      display: flex; align-items: center; gap: 0.5rem;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 1rem 1.5rem;
      margin-bottom: 2rem; flex-wrap: wrap;
    }
    .wf-step {
      padding: 0.4rem 0.875rem; border-radius: 100px;
      background: var(--bg-tertiary); border: 1px solid var(--border);
      font-size: 0.8rem; font-weight: 500; color: var(--text-muted);
      transition: var(--transition);
    }
    .wf-step.active { background: rgba(99,102,241,0.15); color: var(--primary-light); border-color: rgba(99,102,241,0.4); }
    .wf-arrow { color: var(--text-muted); font-size: 1rem; }

    .queue-header { margin-bottom: 1rem; }
    .queue-header h3 { display: flex; align-items: center; gap: 0.5rem; }
    .count-badge {
      background: rgba(14,165,233,0.2); color: #38bdf8;
      border: 1px solid rgba(14,165,233,0.4);
      border-radius: 100px; padding: 0.1rem 0.6rem; font-size: 0.75rem; font-weight: 700;
    }
    .count-badge.finance { background: rgba(245,158,11,0.2); color: #fbbf24; border-color: rgba(245,158,11,0.4); }

    .empty-state { text-align: center; padding: 2rem; color: var(--text-muted); }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

    .approval-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .approval-card { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    .ap-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .ap-info { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .info-row { display: flex; gap: 0.5rem; font-size: 0.875rem; flex-wrap: wrap; align-items: flex-start; }
    .info-row span:first-child { color: var(--text-muted); white-space: nowrap; flex-shrink: 0; }
    .over-budget { color: var(--danger) !important; }
    .approval-action { border-top: 1px solid var(--border); padding-top: 1rem; }

    .mt-3 { margin-top: 2rem; }
    .mt-1 { margin-top: 0.75rem; }
  `]
})
export class ApprovalPanelComponent implements OnInit {
  managerQueue: TravelRequest[] = [];
  financeQueue: TravelRequest[] = [];
  loadingManager = true;
  loadingFinance = true;

  // Separate state stores for each queue to avoid collisions
  managerStates: Record<number, { comments: string; loading: boolean; done: boolean; result?: string; error?: string }> = {};
  financeStates: Record<number, { comments: string; loading: boolean; done: boolean; result?: string; error?: string }> = {};

  constructor(public auth: AuthService, private requestService: TravelRequestService) {}

  get panelTitle(): string {
    if (this.auth.isManager) return '🔵 Manager Approval Panel';
    if (this.auth.isFinance) return '💼 Finance Approval Panel';
    return '⚙️ Admin — Full Approval Panel';
  }

  get panelSubtitle(): string {
    if (this.auth.isManager) return 'Review SUBMITTED requests from employees.';
    if (this.auth.isFinance) return 'Final approval for manager-approved requests.';
    return 'You can approve at both Manager and Finance levels.';
  }

  ngOnInit() {
    // Load Manager queue for Manager / Admin
    if (this.auth.isManager || this.auth.isAdmin) {
      this.requestService.getPendingForManager().subscribe({
        next: res => {
          if (res.success) {
            this.managerQueue = res.data;
            this.managerQueue.forEach(r => {
              this.managerStates[r.id] = { comments: '', loading: false, done: false };
            });
          }
          this.loadingManager = false;
        },
        error: () => { this.loadingManager = false; }
      });
    } else {
      this.loadingManager = false;
    }

    // Load Finance queue for Finance / Admin
    if (this.auth.isFinance || this.auth.isAdmin) {
      this.requestService.getPendingForFinance().subscribe({
        next: res => {
          if (res.success) {
            this.financeQueue = res.data;
            this.financeQueue.forEach(r => {
              this.financeStates[r.id] = { comments: '', loading: false, done: false };
            });
          }
          this.loadingFinance = false;
        },
        error: () => { this.loadingFinance = false; }
      });
    } else {
      this.loadingFinance = false;
    }
  }

  getState(requestId: number, queueType: string) {
    const states = queueType === 'manager' ? this.managerStates : this.financeStates;
    return states[requestId] || { comments: '', loading: false, done: false };
  }

  decide(requestId: number, status: 'APPROVED' | 'REJECTED', queueType: string) {
    const states = queueType === 'manager' ? this.managerStates : this.financeStates;
    states[requestId].loading = true;
    states[requestId].error = undefined;

    this.requestService.processApproval({
      requestId,
      status,
      comments: states[requestId].comments
    }).subscribe({
      next: () => {
        states[requestId] = { ...states[requestId], loading: false, done: true, result: status };
      },
      error: (err) => {
        states[requestId].loading = false;
        states[requestId].error = err.error?.message || 'Action failed. Please try again.';
      }
    });
  }
}
