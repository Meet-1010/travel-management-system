// pages/expenses/expenses.component.ts
// Employee expense management for approved requests

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TravelRequestService } from '../../services/travel-request.service';
import { TravelRequest, Expense } from '../../models/travel-request.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width: 900px; margin: 0 auto;">
      <div class="page-header">
        <h1>Expense Management</h1>
        <p *ngIf="request">Request #{{ request.id }} — {{ request.destination }}</p>
      </div>

      <!-- Request Info Card -->
      <div class="card grid-2 mb-2" *ngIf="request" style="margin-bottom: 1.5rem">
        <div>
          <div class="text-muted" style="font-size: 0.8rem">TRAVEL REQUEST</div>
          <div style="font-size: 1.1rem; font-weight: 700;">{{ request.destination }}</div>
          <div class="text-muted" style="margin-top: 0.25rem">{{ request.startDate | date:'MMM d' }} → {{ request.endDate | date:'MMM d, y' }}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size: 0.8rem">STATUS</div>
          <span class="badge mt-1" [class]="'badge-' + request.status.toLowerCase()">{{ request.status }}</span>
          <div class="text-muted mt-1" style="font-size: 0.8rem">Budget: ₹{{ request.budget | number }} | Total Expenses: <strong style="color: var(--success)">₹{{ totalAmount | number }}</strong></div>
        </div>
      </div>

      <!-- Add Expense Form (only for APPROVED requests owned by current user) -->
      <div class="card mb-2" *ngIf="request?.status === 'APPROVED' && auth.isEmployee">
        <h3 class="mb-2">Add Expense</h3>
        <div class="grid-2">
          <div class="form-group">
            <label>Category</label>
            <select class="form-control" [(ngModel)]="newExpense.category">
              <option value="">Select category</option>
              <option value="travel">Travel (Flights/Train)</option>
              <option value="accommodation">Accommodation</option>
              <option value="food">Food & Meals</option>
              <option value="transport">Local Transport</option>
              <option value="misc">Miscellaneous</option>
            </select>
          </div>
          <div class="form-group">
            <label>Amount (₹)</label>
            <input type="number" class="form-control" [(ngModel)]="newExpense.amount" placeholder="e.g., 1500" min="0.01">
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" class="form-control" [(ngModel)]="newExpense.description" placeholder="Brief description...">
        </div>
        <div class="form-group">
          <label>Upload Proof (Simulated)</label>
          <input type="url" class="form-control" [(ngModel)]="newExpense.receiptUrl" placeholder="Enter image or receipt URL (optional)">
        </div>

        <div *ngIf="expError" class="alert alert-error">{{ expError }}</div>

        <button class="btn btn-primary" (click)="addExpense()" [disabled]="addingExpense">
          {{ addingExpense ? '⏳ Adding...' : 'Add Expense' }}
        </button>
      </div>

      <div *ngIf="request?.status !== 'APPROVED'" class="alert alert-info">
        ℹ️ Expenses can only be added to APPROVED requests. Current status: <strong>{{ request?.status }}</strong>
      </div>

      <!-- Expense List -->
      <div class="card">
        <div class="flex-between mb-2">
          <h3>Expense List</h3>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--success)">
            Total: ₹{{ totalAmount | number }}
          </div>
        </div>

        <div *ngIf="loadingExpenses" class="spinner"></div>

        <div *ngIf="!loadingExpenses && expenses.length === 0" class="text-center text-muted" style="padding: 2rem">
          No expenses added yet.
        </div>

        <div class="table-container" *ngIf="!loadingExpenses && expenses.length > 0">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Proof</th>
                <th>Status</th>
                <th>Date</th>
                <th *ngIf="auth.isFinance || auth.isAdmin">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let exp of expenses">
                <td><span class="badge badge-submitted">{{ exp.category }}</span></td>
                <td>{{ exp.description || '—' }}</td>
                <td><strong>₹{{ exp.amount | number }}</strong></td>
                <td>
                   <a *ngIf="exp.receiptUrl" [href]="exp.receiptUrl" target="_blank" class="text-primary">View</a>
                   <span *ngIf="!exp.receiptUrl" class="text-muted">—</span>
                </td>
                <td>
                   <span class="badge" [class.badge-success]="exp.reimbursed" [class.badge-draft]="!exp.reimbursed">
                     {{ exp.reimbursed ? 'Paid' : 'Pending' }}
                   </span>
                </td>
                <td class="text-muted">{{ exp.createdAt | date:'MMM d, y' }}</td>
                <td *ngIf="auth.isFinance || auth.isAdmin">
                   <button *ngIf="!exp.reimbursed" class="btn btn-sm btn-success" (click)="reimburse(exp.id)">Mark Paid</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ExpensesComponent implements OnInit {
  request: TravelRequest | null = null;
  expenses: Expense[] = [];
  totalAmount = 0;
  loadingExpenses = true;
  addingExpense = false;
  expError = '';

  newExpense = { category: '', amount: null as any, description: '', receiptUrl: '' };

  constructor(
    private route: ActivatedRoute,
    private requestService: TravelRequestService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.requestService.getRequest(id).subscribe(res => {
      if (res.success) this.request = res.data;
    });
    this.loadExpenses(id);
  }

  loadExpenses(id: number) {
    this.loadingExpenses = true;
    this.requestService.getExpenses(id).subscribe(res => {
      if (res.success) {
        this.expenses = res.data;
        this.totalAmount = this.expenses.reduce((sum, e) => sum + e.amount, 0);
      }
      this.loadingExpenses = false;
    });
  }

  addExpense() {
    if (!this.newExpense.category || !this.newExpense.amount) {
      this.expError = 'Please fill in category and amount.';
      return;
    }
    this.addingExpense = true;
    this.expError = '';

    this.requestService.addExpense(
      this.request!.id, this.newExpense.category,
      this.newExpense.amount, this.newExpense.description, this.newExpense.receiptUrl
    ).subscribe({
      next: res => {
        if (res.success) {
          this.expenses.push(res.data);
          this.totalAmount += res.data.amount;
          this.newExpense = { category: '', amount: null, description: '', receiptUrl: '' };
        }
        this.addingExpense = false;
      },
      error: err => {
        this.expError = err.error?.message || 'Failed to add expense';
        this.addingExpense = false;
      }
    });
  }

  reimburse(expenseId: number) {
    if(!confirm("Mark this expense as reimbursed?")) return;
    this.requestService.markAsReimbursed(expenseId).subscribe(res => {
      if(res.success) {
        const exp = this.expenses.find(e => e.id === expenseId);
        if(exp) exp.reimbursed = true;
      }
    });
  }
}
