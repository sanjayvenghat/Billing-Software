import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Inject } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  constructor(private http: HttpClient) {

  }
  private keystorage = inject(KEYSSTORAGE)
  API_BASE_URL = environment.LoginUrl;
  ApplyProductDiscount(discountData: any) {
    discountData.CompanyId = this.keystorage.getItem("CompanyId")
    return this.http.post(`${this.API_BASE_URL}/apply-product-discount`, discountData).pipe(
      map((response: any) => response),
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
