// services/travel-request.service.ts
// Handles all travel request API calls

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { TravelRequest, TravelRequestForm, ApprovalAction, Expense } from '../models/travel-request.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TravelRequestService {

  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Create a new DRAFT request
  createRequest(form: TravelRequestForm): Observable<ApiResponse<TravelRequest>> {
    return this.http.post<ApiResponse<TravelRequest>>(`${this.API}/requests`, form);
  }

  // Get single request
  getRequest(id: number): Observable<ApiResponse<TravelRequest>> {
    return this.http.get<ApiResponse<TravelRequest>>(`${this.API}/requests/${id}`);
  }

  // Get current employee's requests
  getMyRequests(): Observable<ApiResponse<TravelRequest[]>> {
    return this.http.get<ApiResponse<TravelRequest[]>>(`${this.API}/requests/my`);
  }

  // Submit a DRAFT request for approval
  submitRequest(id: number): Observable<ApiResponse<TravelRequest>> {
    return this.http.post<ApiResponse<TravelRequest>>(`${this.API}/requests/${id}/submit`, {});
  }

  // Manager: get requests pending manager approval
  getPendingForManager(): Observable<ApiResponse<TravelRequest[]>> {
    return this.http.get<ApiResponse<TravelRequest[]>>(`${this.API}/requests/pending/manager`);
  }

  // Finance: get requests pending finance approval
  getPendingForFinance(): Observable<ApiResponse<TravelRequest[]>> {
    return this.http.get<ApiResponse<TravelRequest[]>>(`${this.API}/requests/pending/finance`);
  }

  // Admin: get all requests
  getAllRequests(): Observable<ApiResponse<TravelRequest[]>> {
    return this.http.get<ApiResponse<TravelRequest[]>>(`${this.API}/requests/all`);
  }

  // Approve or reject a request
  processApproval(action: ApprovalAction): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API}/approve`, action);
  }

  // Add expense to an approved request
  addExpense(requestId: number, category: string, amount: number, description?: string, receiptUrl?: string): Observable<ApiResponse<Expense>> {
    return this.http.post<ApiResponse<Expense>>(`${this.API}/expenses`, {
      requestId, category, amount, description, receiptUrl
    });
  }

  // Get expenses for a request
  getExpenses(requestId: number): Observable<ApiResponse<Expense[]>> {
    return this.http.get<ApiResponse<Expense[]>>(`${this.API}/expenses/${requestId}`);
  }

  // Get total expenses for a request
  getTotalExpenses(requestId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API}/expenses/${requestId}/total`);
  }

  // Mark expense as reimbursed (Finance/Admin)
  markAsReimbursed(expenseId: number): Observable<ApiResponse<Expense>> {
    return this.http.put<ApiResponse<Expense>>(`${this.API}/expenses/${expenseId}/reimburse`, {});
  }

  // Dashboard stats
  getDashboardStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API}/reports/dashboard`);
  }

  // Department spend
  getDepartmentSpend(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API}/reports/department-spend`);
  }

  // Audit logs
  getAuditLogs(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.API}/reports/audit-logs`);
  }
}
