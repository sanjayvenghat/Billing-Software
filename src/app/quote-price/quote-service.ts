import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  private apiUrl = `${environment.LoginUrl}/api/grocery`;
  constructor(private http: HttpClient) { }
  AddgroceryData(data: any): Observable<any> {
    return this.http.post(this.apiUrl + "/AddGrocery", data).pipe(
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
