import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
@Injectable({
  providedIn: 'root',
})
export class SettingService {
  private apiUrl = `${environment.LoginUrl}/api/grocery`;
  constructor(private HttpClient: HttpClient, private keysStorage: KEYSSTORAGE) {

  }
  private getHeaders(): HttpHeaders {
    const token = this.keysStorage.getItem("Token");
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  getIconList(): Observable<any> {
    return this.HttpClient.get<any>(`${this.apiUrl}/getIconList`)
      .pipe(
        map((response: any) => {
          return response.map((item: any) => {
            return item
          });
        }),
        catchError((error: any) => {
          // ⭐ Optional: You can process the error here
          return throwError(() => error.error?.message || 'Failed');
        })
      );
  }
  UpdateSetting(data: any): Observable<any> {
    const url = `${this.apiUrl}/updateuserSetting`;
    return this.HttpClient.post<any>(url, data, { headers: this.getHeaders() }).pipe(
      map((val) => {
        return val;
      }),
      catchError((err: any) => {
        console.error('Error updating user setting:', err);
        return throwError(() => err.error?.message || 'Failed to update user setting');
      })
    );
  }

}
