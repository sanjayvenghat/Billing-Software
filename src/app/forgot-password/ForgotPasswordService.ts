import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {

  private apiUrl = environment?.LoginUrl; // Assuming it uses the same base login/auth URL

  constructor(private http: HttpClient) { }

  getOtp(payload: any) {
    return this.http.post(`${this.apiUrl}/Register/getOtp`, payload).pipe(
      map((val: any) => {
        return val;
      }),
      catchError((error) => {
        console.error('OTP Error:', error);
        return throwError(() => error);
      })
    );
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    const payload = { email, otp };
    return this.http.post<any>(`${this.apiUrl}/Register/verifyOtp`, payload).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: any) => {
        return throwError(() => error.error?.message || 'Verification failed');
      })
    );
  }

  resetPassword(payload: any): Observable<any> {
    // Calling the ResetPassword endpoint we just created in the backend
    return this.http.post<any>(`${this.apiUrl}/Register/ResetPassword`, payload).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => {
        console.error('Reset Password error:', error);
        return throwError(() => error.error?.message || 'Failed to reset password');
      })
    );
  }
}
