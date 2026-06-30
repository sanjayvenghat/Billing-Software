import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';

@Injectable({
  providedIn: 'root',
})
export class NewUser {
  private apiUrl = environment?.LoginUrl;
  private getHeaders(): HttpHeaders {
    const token = this.keysStorage.getItem("Token");
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  constructor(private http: HttpClient, private keysStorage: KEYSSTORAGE) { }
  AddCustomer(payload: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/user/addcustomer`, payload, { headers }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error) => {
        console.error('Add Customer error:', error);
        return throwError(() => error.error?.message || 'Add Customer failed');
      })
    );
  }


}
