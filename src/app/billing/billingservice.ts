import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Billingservice {
  constructor(private http: HttpClient) { }

  searchUsers(query: any): Observable<any[]> {
    return this.http.post<any[]>(`${environment.LoginUrl}/api/Billing/search`, query);
  }
  searchProduct(query: any): Observable<any[]> {
    return this.http.post<any[]>(`${environment.LoginUrl}/api/Billing/searchProduct`, query);
  }
  SavePendingBill(request: any): Observable<any[]> {
    return this.http.post<any[]>(`${environment.LoginUrl}/api/Billing/SavePendingBill`, request);
  }
}
