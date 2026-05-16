// pages/travel-requests/travel-requests.component.ts
// Employee view of their own travel requests

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TravelRequestService } from '../../services/travel-request.service';
import { TravelRequest } from '../../models/travel-request.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-travel-requests',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="page-header flex-between">
        <div>
          <h1>🧳 My Travel Requests</h1>
          <p>Track all your travel requests and their approval status.</p>
        </div>
        <a routerLink="/travel-requests/new" class="btn btn-primary">➕ New Request</a>
      </div>

      <!-- Filter badges -->
      <div class="filter-row">
        <button *ngFor="let f of filters" class="filter-btn"
                [class.active]="activeFilter === f" (click)="setFilter(f)">
          {{ f }}
        </button>
      </div>

      <div *ngIf="loading" class="spinner"></div>

      <div *ngIf="!loading && filtered.length === 0" class="card text-center" style="padding: 3rem">
        <div style="font-size: 3rem; margin-bottom: 1rem">🧳</div>
        <h3>No requests found</h3>
        <p class="text-muted mt-1">Create your first travel request to get started.</p>
        <a routerLink="/travel-requests/new" class="btn btn-primary mt-2">Create Request</a>
      </div>

      <div class="requests-grid" *ngIf="!loading && filtered.length > 0">
        <div class="request-card card" *ngFor="let req of filtered">
          <div class="req-header">
            <div>
              <h4>✈️ {{ req.destination }}</h4>
              <div class="text-muted" style="font-size: 0.8rem">Request #{{ req.id }}</div>
            </div>
            <span class="badge" [class]="'badge-' + req.status.toLowerCase()">
              {{ req.status.replace('_', ' ') }}
            </span>
          </div>

          <div class="req-details">
            <div class="req-detail">
              <span class="det-icon">📅</span>
              <span>{{ req.startDate | date:'MMM d' }} → {{ req.endDate | date:'MMM d, y' }}</span>
            </div>
            <div class="req-detail">
              <span class="det-icon">💰</span>
              <span>Budget: ₹{{ req.budget | number }}</span>
            </div>
            <div class="req-detail" *ngIf="req.totalExpenses > 0">
              <span class="det-icon">🧾</span>
              <span>Expenses: ₹{{ req.totalExpenses | number }}</span>
            </div>
            <div class="req-detail">
              <span class="det-icon">📝</span>
              <span>{{ req.purpose | slice:0:60 }}{{ req.purpose.length > 60 ? '...' : '' }}</span>
            </div>
          </div>

          <div class="req-actions">
            <a [routerLink]="['/itinerary', req.id]" class="btn btn-secondary btn-sm">
              🗺️ Itinerary
            </a>
            <a [routerLink]="['/expenses', req.id]" class="btn btn-secondary btn-sm">
              🧾 Expenses
            </a>
            <button *ngIf="req.status === 'DRAFT'" class="btn btn-primary btn-sm" (click)="submit(req.id)">
              📤 Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-row { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .filter-btn {
      padding: 0.375rem 0.875rem; border-radius: 100px;
      background: var(--bg-tertiary); border: 1px solid var(--border);
      color: var(--text-secondary); cursor: pointer; font-size: 0.8rem;
      transition: var(--transition); font-weight: 500;
    }
    .filter-btn.active, .filter-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }

    .requests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; }
    .request-card { animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; } }
    .req-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .req-details { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .req-detail { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
    .det-icon { flex-shrink: 0; }
    .req-actions { display: flex; gap: 0.5rem; }
  `]
})
export class TravelRequestsComponent implements OnInit {
  requests: TravelRequest[] = [];
  filtered: TravelRequest[] = [];
  loading = true;
  activeFilter = 'ALL';
  filters = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'];

  constructor(private requestService: TravelRequestService, public auth: AuthService) {}

  ngOnInit() {
    const obs = this.auth.isAdmin
      ? this.requestService.getAllRequests()
      : this.requestService.getMyRequests();

    obs.subscribe({
      next: res => {
        if (res.success) { this.requests = res.data; this.filtered = res.data; }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  setFilter(f: string) {
    this.activeFilter = f;
    this.filtered = f === 'ALL' ? this.requests : this.requests.filter(r => r.status === f);
  }

  submit(id: number) {
    this.requestService.submitRequest(id).subscribe({
      next: res => {
        if (res.success) {
          const req = this.requests.find(r => r.id === id);
          if (req) req.status = 'SUBMITTED';
        }
      }
    });
  }
}
