// services/auth.service.ts
// Handles login, logout, token storage, and current user state

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

/**
 * AuthService
 *
 * BehaviorSubject: A reactive stream that holds the current user.
 * Any component can subscribe to currentUser$ and get notified when
 * the user logs in or out.
 *
 * localStorage: Persists the JWT token across browser refreshes.
 * On app load, we read the token and rebuild the user state.
 */
@Injectable({
  providedIn: 'root'  // Singleton - one instance for the whole app
})
export class AuthService {

  private readonly API = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'tms_token';
  private readonly USER_KEY = 'tms_user';

  // BehaviorSubject: components can subscribe to get current auth state
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(
    this.getStoredUser()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /** Login and store JWT in localStorage */
  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API}/login`, request).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem(this.TOKEN_KEY, response.data.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.data));
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  /** Register a new user (Admin only) */
  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API}/register`, request);
  }

  /** Get all users (Admin) */
  getAllUsers(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.API}/users`);
  }

  /** Logout: clear storage and redirect */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /** Get the stored JWT token (sent with each HTTP request by the interceptor) */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Get the current user synchronously */
  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  get currentRole(): string {
    return this.getCurrentUser()?.role || '';
  }

  get isAdmin(): boolean { return this.currentRole === 'ADMIN'; }
  get isEmployee(): boolean { return this.currentRole === 'EMPLOYEE'; }
  get isManager(): boolean { return this.currentRole === 'MANAGER'; }
  get isFinance(): boolean { return this.currentRole === 'FINANCE'; }

  private getStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}
