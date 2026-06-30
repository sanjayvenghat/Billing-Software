import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';

@Injectable({
  providedIn: 'root',
})
export class Billingservice {
  constructor(private http: HttpClient, private keysStorage: KEYSSTORAGE) { }

  private getHeaders(): HttpHeaders {
    const token = this.keysStorage.getItem("Token");
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  searchUsers(query: any): Observable<any[]> {
    return this.http.post<any[]>(`${environment.LoginUrl}/api/Billing/search`, query, { headers: this.getHeaders() });
  }
  searchProduct(query: any): Observable<any[]> {
    return this.http.post<any[]>(`${environment.LoginUrl}/api/Billing/searchProduct`, query, { headers: this.getHeaders() });
  }
  SavePendingBill(request: any): Observable<any[]> {
    return this.http.post<any[]>(`${environment.LoginUrl}/api/Billing/SavePendingBill`, request, { headers: this.getHeaders() });
  }
  PayPendingBill(request: any): Observable<any> {
    return this.http.post<any>(`${environment.LoginUrl}/api/Billing/PayPendingBill`, request, { headers: this.getHeaders() });
  }
  PayCustomerDues(request: any): Observable<any> {
    return this.http.post<any>(`${environment.LoginUrl}/api/Billing/PayCustomerDues`, request, { headers: this.getHeaders() });
  }
}
