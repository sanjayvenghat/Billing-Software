import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { authInterceptor } from '../auth.interceptor';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';

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
export class LoginService {

    private apiUrl = environment?.LoginUrl;


    constructor(private http: HttpClient, private keysStorage: KEYSSTORAGE) { }
    Login(payload: any) {
        return this.http.post(`${this.apiUrl}/Register/login`, payload).pipe(
            map((response: any) => {
                this.keysStorage.setItem("CompanyId", response?.CompanyId);
                this.keysStorage.setItem("Token", response?.token);
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
        return this.http.get(`${this.apiUrl}/Register/getOtp`, { params: payload }).pipe(
            // Example RxJS operator (make sure to import map, tap, etc. from 'rxjs/operators')
            map((val: any) => {
                if (val?.message == "Login SuccessFul") {
                    // Correct way to store the token
                    let token = val?.token;

                    if (token) {
                        this.keysStorage.setItem("Token", token);
                    } else {
                        console.error("Token not found in response");
                    }
                }
            })
        );
    }
    logout(): void {
        this.keysStorage.removeItem('Token');
        this.keysStorage.removeItem('CompanyId');
    }

    getToken(): string | null {
        return this.keysStorage.getItem('Token');
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
    getSettings() {
        let companyId = this.keysStorage.getItem("CompanyId")
        return this.http.get(`${this.apiUrl}/Register/getSettings/${companyId}`, {
            headers: this.getAuthHeaders()
        }).pipe(map((response: any) => {
            console.log(response);
            this.keysStorage.setItem('IconType', response?.userSettings?.IconType)
            this.keysStorage.setItem('StoreName', response?.userSettings?.StoreName)
            this.keysStorage.setItem('APP_SETTINGS', response?.userSettings)
            return response;
        }), catchError(err => {
            console.error('Login error:', err);
            return throwError(() => err.error?.message || 'Login failed');
        }))
    }
}