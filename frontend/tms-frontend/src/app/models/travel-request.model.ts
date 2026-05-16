// models/travel-request.model.ts
// These match the Spring Boot DTOs and entity status enums

export type RequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'MANAGER_APPROVED'
  | 'FINANCE_APPROVED'
  | 'APPROVED'
  | 'REJECTED';

export interface TravelRequest {
  id: number;
  destination: string;
  startDate: string;      // ISO date string: "2024-06-01"
  endDate: string;
  purpose: string;
  budget: number;
  status: RequestStatus;
  employeeName: string;
  employeeEmail: string;
  department?: string;
  createdAt: string;
  totalExpenses: number;
}

export interface TravelRequestForm {
  destination: string;
  startDate: string;
  endDate: string;
  purpose: string;
  budget: number;
}

export interface Expense {
  id: number;
  requestId: number;
  category: string;
  amount: number;
  description?: string;
  receiptPath?: string;
  receiptUrl?: string;
  reimbursed: boolean;
  createdAt: string;
}

export interface ApprovalAction {
  requestId: number;
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
}
