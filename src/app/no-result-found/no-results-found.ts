import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class NoResultsFound {
  constructor(private http: HttpClient) {

  }
  GetErrorstatusResponse(): Observable<any> {
    return this.http.get("https://http.cat/404", {
      responseType: 'blob'
    }).pipe(map((val: any) => {
      return val;
    }),
      catchError((error) => {
        console.error('Error updating grocery price:', error);
        return throwError(() => error);
      })
    );
  }
}
