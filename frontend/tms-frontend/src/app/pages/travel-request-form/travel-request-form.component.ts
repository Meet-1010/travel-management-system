// pages/travel-request-form/travel-request-form.component.ts
// Form to create a new travel request

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TravelRequestService } from '../../services/travel-request.service';

@Component({
  selector: 'app-travel-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width: 720px; margin: 0 auto;">
      <div class="page-header">
        <h1>🧳 New Travel Request</h1>
        <p>Fill in the details below to create a travel request. Save as draft or submit immediately.</p>
      </div>

      <div class="card">
        <form (ngSubmit)="submit(false)">
          <div class="grid-2">
            <div class="form-group">
              <label>📍 Destination *</label>
              <input type="text" class="form-control" [(ngModel)]="form.destination" name="destination"
                     placeholder="e.g., Mumbai, New York" required>
            </div>
            <div class="form-group">
              <label>💰 Estimated Budget (₹) *</label>
              <input type="number" class="form-control" [(ngModel)]="form.budget" name="budget"
                     placeholder="e.g., 25000" min="1" required>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>📅 Start Date *</label>
              <input type="date" class="form-control" [(ngModel)]="form.startDate" name="startDate" required>
            </div>
            <div class="form-group">
              <label>📅 End Date *</label>
              <input type="date" class="form-control" [(ngModel)]="form.endDate" name="endDate" required>
            </div>
          </div>

          <div class="form-group">
            <label>📝 Purpose of Travel *</label>
            <textarea class="form-control" [(ngModel)]="form.purpose" name="purpose" rows="4"
                      placeholder="Describe the purpose of this travel request in detail..." required></textarea>
          </div>

          <!-- Policy reminder -->
          <div class="alert alert-info">
            ℹ️ Your request will be reviewed by your Manager and then Finance. Keep budget within ₹50,000 to comply with policy.
          </div>

          <div *ngIf="error" class="alert alert-error">{{ error }}</div>
          <div *ngIf="success" class="alert alert-success">{{ success }}</div>

          <div class="flex gap-2 mt-2">
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? '⏳ Submitting...' : '📤 Submit for Approval' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="submit(true)" [disabled]="loading">
              💾 Save as Draft
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TravelRequestFormComponent {
  form = {
    destination: '',
    startDate: '',
    endDate: '',
    purpose: '',
    budget: null as any
  };
  loading = false;
  error = '';
  success = '';

  constructor(private requestService: TravelRequestService, private router: Router) {}

  submit(draftOnly: boolean) {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.requestService.createRequest(this.form).subscribe({
      next: (res) => {
        if (res.success) {
          if (draftOnly) {
            this.success = '✅ Draft saved successfully! ID: #' + res.data.id;
            this.loading = false;
          } else {
            // Submit the request after creating
            this.requestService.submitRequest(res.data.id).subscribe({
              next: () => { this.router.navigate(['/travel-requests']); },
              error: (err) => {
                this.error = err.error?.message || 'Submit failed. Request created as draft.';
                this.loading = false;
              }
            });
          }
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create request';
        this.loading = false;
      }
    });
  }

  cancel() { this.router.navigate(['/travel-requests']); }
}
