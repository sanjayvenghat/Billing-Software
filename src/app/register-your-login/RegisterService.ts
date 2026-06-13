import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


export interface LoginPayload {
  email: string;
  password: string;
}

// ✅ Only one interface
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private apiUrl = environment?.LoginUrl;


  constructor(private http: HttpClient) { }
  Register(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Register`, payload).pipe(
      map((response) => {


        return response;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error.error?.message || 'Login failed');
      })
    );
  }
  getOtp(payload: any) {
    // Convert the payload object into URL query parameters

    // Pass the params object as the second argument to the get() method
    return this.http.post(`${this.apiUrl}/Register/getOtp`, payload).pipe(
      // Example RxJS operator (make sure to import map, tap, etc. from 'rxjs/operators')
      map((val: any) => {
        return val;
      })
    );
  }
  verifyOtp(email: string, otp: string): Observable<any> {
    const payload = { email, otp };

    return this.http.post<any>(`${this.apiUrl}/Register/verifyOtp`, payload).pipe(
      map((response: any) => {
        // ⭐ Optional: You can process the response here
        return response;
      }),
      catchError((error: any) => {
        // ⭐ Optional: You can process the error here
        return throwError(() => error.error?.message || 'Verification failed');
      })
    );
  }
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`
    });
  }
}