// models/user.model.ts
// TypeScript interfaces mirror the Java DTOs/entities

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'MANAGER' | 'FINANCE';
  department?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: string;
  userId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
}
