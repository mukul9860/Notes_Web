import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'notes_app_token';

  constructor(private http: HttpClient, private router: Router) {}

  signup(user: any) { return this.http.post(`${this.apiUrl}/signup`, user); }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => localStorage.setItem(this.tokenKey, response.token))
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  getToken() { return localStorage.getItem(this.tokenKey); }
}