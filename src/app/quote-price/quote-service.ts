import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  private apiUrl = `${environment.LoginUrl}/api/grocery`;
  constructor(private http: HttpClient, private keysStorage: KEYSSTORAGE) { }

  private getHeaders(): HttpHeaders {
    const token = this.keysStorage.getItem("Token");
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  AddgroceryData(data: any): Observable<any> {
    return this.http.post(this.apiUrl + "/AddGrocery", data, { headers: this.getHeaders() }).pipe(
      map((val: any) => {
        return val;
      }),
      catchError((error) => {
        console.error('Error fetching grocery data:', error);
        return throwError(() => error);
      })
    );
  }
}
