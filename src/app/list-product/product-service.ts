import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private apiUrl = `${environment.LoginUrl}/api/grocery`;
  constructor(private http: HttpClient, private keysStorage: KEYSSTORAGE) { }

  private getHeaders(): HttpHeaders {
    const token = this.keysStorage.getItem("Token");
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  GetUserProducts(CompanyId: string): Observable<any> {
    const apiUrl = `${this.apiUrl}/GetUserProducts?CompanyId=${CompanyId}`;
    return this.http.get(apiUrl, { headers: this.getHeaders() }).pipe(
      map((val: any) => {
        return val;
      }),
      catchError((error) => {
        console.error('Error fetching grocery data:', error);
        return throwError(() => error);
      })
    );
  }

  UpdateProductPrice(ProductId: string, SellingPrice: string, BuyingPrice: string): Observable<any> {
    const payload = { ProductId, SellingPrice, BuyingPrice };
    return this.http.post(`${this.apiUrl}/UpdateProduct`, payload, { headers: this.getHeaders() }).pipe(
      map((val: any) => {
        return val;
      }),
      catchError((error) => {
        console.error('Error updating grocery price:', error);
        return throwError(() => error);
      })
    );
  }

  DeleteProduct(ProductId: string): Observable<any> {
    const payload = { ProductId };
    return this.http.post(`${this.apiUrl}/DeleteProduct`, payload, { headers: this.getHeaders() }).pipe(
      map((val: any) => {
        return val;
      }),
      catchError((error) => {
        console.error('Error deleting grocery product:', error);
        return throwError(() => error);
      })
    );
  }

}
