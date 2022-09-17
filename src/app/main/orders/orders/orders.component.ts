import { ProductsService } from "./../../../../services/data/products/products.service";
import { LoaderService } from "./../../../../services/classes/loader/loader.service";
import { finalize } from "rxjs/operators";
import { Router } from "@angular/router";
import { NotificationsService } from "./../../../../services/classes/notifications/notifications.service";
import { OrdersService } from "./../../../../services/data/orders/orders.service";
import { Logger } from "src/services/core/logger/logger.service";
import { Component, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material";

const log = new Logger("Orders");
@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.css"],
})
export class OrdersComponent implements OnInit {
  orders: any[];
  isPageLoading = false;
  relatedProducts: any[] = [];

  pageSizeOptions: number[] = [10, 20, 30];

  pageEvent: PageEvent = {
    length: 0,
    pageIndex: 1,
    pageSize: 10,
  };

  constructor(
    private ordersService: OrdersService,
    private notifyService: NotificationsService,
    private loaderService: LoaderService,
    private router: Router,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    this.getAllOrders();
  }

  getAllOrders(currentPage = 1, pageSize = 10) {
    this.isPageLoading = true;
    const orders$ = this.ordersService.getOrders(currentPage, pageSize);
    orders$
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("orders: ", res);
            this.orders = res.data.data;
            this.pageEvent.pageSize = res.data.per_page;
            this.pageEvent.pageIndex = res.data.current_page;
            this.pageEvent.length = res.data.total;
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => log.debug("error: ", error)
      );
  }

  onPageChange(event: PageEvent) {
    this.loaderService.show();
    this.pageEvent = { ...this.pageEvent, ...event };
    let { pageSize, pageIndex } = this.pageEvent;
    this.getAllOrders(pageIndex, pageSize);
  }

  seeOrderDetails(order: any) {
    log.debug('order" ', order);

    sessionStorage.setItem("orderDetails", JSON.stringify(order));
    this.router.navigate(["/", "orders", "details"]);
  }

  getProductDetailsFromServer(productId: number) {
    const productDetails$ = this.productsService.getProductDetails(productId);
    productDetails$.subscribe(
      (res: any) => {
        if (res.error === false) {
          if (res.data.relatedproduct) {
            this.relatedProducts = res.data.relatedproduct;
            this.relatedProducts = this.relatedProducts.slice(0, 4);
            log.debug("related: ", res.data);
          } else {
            this.relatedProducts = [];
          }
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }
}
