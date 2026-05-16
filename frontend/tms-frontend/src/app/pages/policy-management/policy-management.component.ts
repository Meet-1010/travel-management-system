import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-policy-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Policy Management</h1>
        <p>Manage corporate travel policies, budget limits, and allowed classes.</p>
      </div>

      <div class="grid-2">
        <!-- Create Policy Form -->
        <div class="card" *ngIf="auth.isAdmin">
          <h3 class="mb-2">Create New Policy</h3>
          <form (ngSubmit)="createPolicy()">
            <div class="form-group">
              <label>Policy Name</label>
              <input type="text" class="form-control" [(ngModel)]="newPolicy.policyName" name="name" required placeholder="e.g., Executive Travel">
            </div>
            <div class="form-group">
              <label>Max Budget (₹)</label>
              <input type="number" class="form-control" [(ngModel)]="newPolicy.maxBudget" name="budget" required>
            </div>
            <div class="form-group">
              <label>Allowed Class</label>
              <select class="form-control" [(ngModel)]="newPolicy.allowedClass" name="class">
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
                <option value="First Class">First Class</option>
              </select>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea class="form-control" [(ngModel)]="newPolicy.description" name="desc" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary w-100" [disabled]="loading">Create Policy</button>
          </form>
        </div>

        <!-- Policy List -->
        <div class="card">
          <h3 class="mb-2">Active Policies</h3>
          <div *ngIf="loading" class="spinner"></div>
          
          <div *ngIf="!loading && policies.length === 0" class="text-center text-muted" style="padding: 2rem;">
            No policies defined yet.
          </div>

          <div class="policy-list" *ngIf="!loading">
            <div *ngFor="let p of policies" class="policy-item">
              <div class="p-header flex-between">
                <strong>{{ p.policyName }}</strong>
                <span class="badge badge-draft">{{ p.allowedClass }}</span>
              </div>
              <div class="p-budget">Limit: ₹{{ p.maxBudget }}</div>
              <p class="p-desc">{{ p.description }}</p>
              
              <button *ngIf="auth.isAdmin" (click)="deletePolicy(p.id)" class="btn btn-danger btn-sm mt-1">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .w-100 { width: 100%; justify-content: center; }
    
    .policy-list { display: flex; flex-direction: column; gap: 1rem; }
    .policy-item {
      padding: 1.25rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
    }
    .p-header { margin-bottom: 0.5rem; }
    .p-budget { color: var(--brand); font-weight: 700; font-size: 0.9rem; margin-bottom: 0.5rem; }
    .p-desc { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }
  `]
})
export class PolicyManagementComponent implements OnInit {
  policies: any[] = [];
  loading = false;
  
  newPolicy = {
    policyName: '',
    maxBudget: 10000,
    allowedClass: 'Economy',
    description: ''
  };

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit() {
    this.loadPolicies();
  }

  loadPolicies() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/policies`).subscribe({
      next: (res) => {
        if (res.success) this.policies = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  createPolicy() {
    if (!this.newPolicy.policyName) return;
    this.loading = true;
    this.http.post<any>(`${environment.apiUrl}/policies`, this.newPolicy).subscribe({
      next: () => {
        this.loadPolicies();
        this.newPolicy.policyName = '';
        this.newPolicy.description = '';
      },
      error: () => this.loading = false
    });
  }

  deletePolicy(id: number) {
    if(!confirm("Delete this policy?")) return;
    this.http.delete(`${environment.apiUrl}/policies/${id}`).subscribe(() => this.loadPolicies());
  }
}
