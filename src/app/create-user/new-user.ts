import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NewUser {
  private apiUrl = environment?.LoginUrl;

  constructor(private http: HttpClient) { }
  AddCustomer(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/addcustomer`, payload).pipe(
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
