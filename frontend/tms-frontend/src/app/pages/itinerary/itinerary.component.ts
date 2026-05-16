import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TravelRequestService } from '../../services/travel-request.service';
import { TravelRequest } from '../../models/travel-request.model';

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width: 900px; margin: 0 auto;">
      <div class="page-header">
        <h1>🗺️ Itinerary Builder</h1>
        <p *ngIf="request">Request #{{ request.id }} — {{ request.destination }}</p>
      </div>

      <div class="card grid-2 mb-2" *ngIf="request">
        <div>
          <div class="text-muted" style="font-size: 0.8rem">TRAVEL DATES</div>
          <div style="font-size: 1.1rem; font-weight: 700;">{{ request.startDate | date:'mediumDate' }} → {{ request.endDate | date:'mediumDate' }}</div>
        </div>
        <div>
           <span class="badge" [class]="'badge-' + request.status.toLowerCase()">{{ request.status }}</span>
        </div>
      </div>

      <!-- Add Itinerary Form -->
      <div class="card mb-2" *ngIf="auth.isEmployee || auth.isAdmin">
        <h3 class="mb-2">➕ Add Travel Segment / Stay</h3>
        <div class="grid-2">
          <div class="form-group">
            <label>Type</label>
            <select class="form-control" [(ngModel)]="newItem.type">
              <option value="FLIGHT">✈️ Flight</option>
              <option value="TRAIN">🚆 Train</option>
              <option value="HOTEL">🏨 Hotel</option>
              <option value="CAB">🚕 Cab</option>
              <option value="BUS">🚌 Bus</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" class="form-control" [(ngModel)]="newItem.travelDate">
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" class="form-control" [(ngModel)]="newItem.description" placeholder="e.g. Indigo 6E-234, Check-in at Taj Hotel...">
        </div>
        
        <button class="btn btn-primary" (click)="addItinerary()" [disabled]="adding">
          {{ adding ? '⏳ Adding...' : '➕ Add to Itinerary' }}
        </button>
      </div>

      <!-- Timeline -->
      <div class="card">
        <h3 class="mb-2">Travel Timeline</h3>
        <div *ngIf="loading" class="spinner"></div>
        <div *ngIf="!loading && items.length === 0" class="text-center text-muted" style="padding: 2rem">
           No itinerary segments added yet.
        </div>

        <div class="itinerary-timeline" *ngIf="!loading && items.length > 0">
           <div class="timeline-item" *ngFor="let item of items">
              <div class="ti-date">{{ item.travelDate | date:'MMM d' }}</div>
              <div class="ti-content">
                 <div class="ti-type">{{ item.type }}</div>
                 <div class="ti-desc">{{ item.description }}</div>
              </div>
              <button class="btn btn-sm btn-danger" *ngIf="auth.isEmployee || auth.isAdmin" (click)="deleteItem(item.id)">Delete</button>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .itinerary-timeline { display: flex; flex-direction: column; gap: 1rem; }
    .timeline-item { display: flex; align-items: center; gap: 1.5rem; background: var(--bg-elevated); padding: 1rem; border-radius: var(--r-md); border: 1px solid var(--border); }
    .ti-date { font-weight: 700; color: var(--brand); min-width: 60px; }
    .ti-content { flex: 1; }
    .ti-type { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.2rem; }
    .ti-desc { font-size: 1rem; }
  `]
})
export class ItineraryComponent implements OnInit {
  request: TravelRequest | null = null;
  items: any[] = [];
  loading = true;
  adding = false;
  
  newItem = { type: 'FLIGHT', description: '', travelDate: '' };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private requestService: TravelRequestService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.requestService.getRequest(id).subscribe(res => {
      if(res.success) this.request = res.data;
    });
    this.loadItinerary(id);
  }

  loadItinerary(id: number) {
    this.loading = true;
    this.http.get<any>(`http://localhost:8081/api/itineraries/${id}`).subscribe({
      next: (res) => {
        if(res.success) this.items = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  addItinerary() {
    if(!this.newItem.description || !this.newItem.travelDate) return;
    this.adding = true;
    const payload = {
       requestId: this.request!.id,
       ...this.newItem
    };
    this.http.post<any>('http://localhost:8081/api/itineraries', payload).subscribe({
       next: (res) => {
          if(res.success) {
             this.items.push(res.data);
             // sort by date
             this.items.sort((a,b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime());
             this.newItem.description = '';
          }
          this.adding = false;
       },
       error: () => this.adding = false
    });
  }

  deleteItem(id: number) {
    if(!confirm("Delete this segment?")) return;
    this.http.delete(`http://localhost:8081/api/itineraries/${id}`).subscribe(() => {
       this.items = this.items.filter(i => i.id !== id);
    });
  }
}
