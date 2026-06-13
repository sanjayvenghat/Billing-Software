import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private apiUrl = `${environment.LoginUrl}/api/grocery`;
  constructor(private http: HttpClient) { }

  GetUserProducts(CompanyId: string): Observable<any> {
    const apiUrl = `${this.apiUrl}/GetUserProducts?CompanyId=${CompanyId}`;
    return this.http.get(apiUrl).pipe(
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
    return this.http.post(`${this.apiUrl}/UpdateProduct`, payload).pipe(
      map((val: any) => {
        return val;
      }),
      catchError((error) => {
        console.error('Error updating grocery price:', error);
        return throwError(() => error);
      })
    );
  }

}
