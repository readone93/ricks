import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { BaseService } from "./../../core/base/base.service";
import { Injectable } from "@angular/core";

const routes = {
  // vendorProducts: "vendor/products",
  vendorProducts: "guest/products/filter?merchant_id=",
  vendors: "guest/vendors",
};
@Injectable({
  providedIn: "root",
})
export class VendorService extends BaseService<any> {
  constructor(http: HttpClient) {
    super(http);
  }

  getAllVendors(currentPage = 1, pageSize = 12): Observable<any> {
    return this.sendGet(this.baseUrl(`${routes.vendors}?page=${currentPage}`));
  }

  // Format: guest/products/filter?merchant_id=3
  getProductsByVendorId(
    vendorId: number,
    currentPage: number = 1,
    per_page: number = 6
  ): Observable<any> {
    return this.sendGet(
      this.baseUrl(`${routes.vendorProducts}${vendorId}?page=${currentPage}`)
    );
  }
}
