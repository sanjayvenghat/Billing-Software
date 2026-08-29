import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LandingService {
  private apiUrl = `${environment.LoginUrl}/api`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  requestAgentCall(phoneNumber: string): Observable<any> {
    const url = `${this.apiUrl}/agentCall/saveAgentCall`;
    return this.http.post<any>(url, { phoneNumber }, { headers: this.getHeaders() });
  }
}
