import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { BaseService } from "./../../core/base/base.service";
import { Injectable } from "@angular/core";
import { Order } from "src/services/classes/models/order";

const routes = {
  orders: "users/orders",
};

export enum PaymentMethod {
  card = 1,
  cash_on_delivery,
  mobile_money,
}

export enum MobileMoneyProvider {
  mtn = 1,
  vod,
  tgo,
}
@Injectable({
  providedIn: "root",
})
export class OrdersService extends BaseService<any> {
  constructor(http: HttpClient) {
    super(http);
  }

  getOrders(currentPage: number = 1, pageSize: number = 10): Observable<any> {
    return this.sendGet(
      this.baseUrl(`${routes.orders}?page=${currentPage}&per_page=${pageSize}`)
    );
  }

  sendOrders(payload: Order): Observable<any> {
    return this.sendPost(this.baseUrl(routes.orders), payload);
  }
}
