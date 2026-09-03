import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { STORAGE_KEYS } from '../constants/storage.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  // State
  private currentUserSignal = signal<Record<string, any> | null>(null);
  private isAuthenticatingSignal = signal<boolean>(false);
  private tokenKey = STORAGE_KEYS.ACCESS_TOKEN;
  private userKey = STORAGE_KEYS.USER;

  // Selectors
  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => {
    const user = this.currentUserSignal();
    return !!user && user['role'] !== 'admin';
  });
  isAuthenticating = computed(() => this.isAuthenticatingSignal());

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    const savedUser = localStorage.getItem(this.userKey);

    if (savedUser) {
      this.currentUserSignal.set(JSON.parse(savedUser));
    }

    // Always verify token/cookie in background
    this.checkAuthStatus();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(credentials: Record<string, any>) {
    this.isAuthenticatingSignal.set(true);
    return this.http.post<Record<string, any>>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res['success']) {
          this.handleAuthSuccess(res);
        }
      }),
      finalize(() => this.isAuthenticatingSignal.set(false)),
    );
  }

  register(userData: Record<string, any>) {
    this.isAuthenticatingSignal.set(true);
    return this.http.post<Record<string, any>>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        if (res['success']) {
          this.handleAuthSuccess(res);
        }
      }),
      finalize(() => this.isAuthenticatingSignal.set(false)),
    );
  }

  private handleAuthSuccess(res: Record<string, any>) {
    const token = res['token'] || res['accessToken'] || res['data']?.['token'] || res['data']?.['accessToken'];
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    }
    
    const user = res['user'] || res['data']?.['user'] || res['data'];
    if (user && typeof user === 'object' && !user.token) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.currentUserSignal.set(user);
    }
  }

  logout() {
    return this.http.post<Record<string, any>>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearAuth(true);
      }),
      catchError(() => {
        this.clearAuth(true);
        return of(null);
      }),
    );
  }

  private clearAuth(shouldRedirect = false) {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSignal.set(null);
    if (shouldRedirect) {
      this.router.navigate(['/login']);
    }
  }

  private checkAuthStatus() {
    this.http.get<Record<string, any>>(`${this.apiUrl}/profile`).subscribe({
      next: (res) => {
        if (res['success']) {
          this.currentUserSignal.set(res['data']);
          localStorage.setItem(this.userKey, JSON.stringify(res['data']));
        } else {
          this.clearAuth(false);
        }
      },
      error: (err) => {
        // Clear stored auth state; the route guard handles redirection
        if (err.status === 401 || err.status === 403) {
          this.clearAuth(false);
        }
      },
    });
  }

  changePassword(passwords: Record<string, string>) {
    return this.http.put<Record<string, any>>(`${this.apiUrl}/change-password`, passwords);
  }
}
