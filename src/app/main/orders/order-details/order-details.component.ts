import { ProductsService } from "./../../../../services/data/products/products.service";
import { Logger } from "./../../../../services/core/logger/logger.service";
import { Router } from "@angular/router";
import { NotificationsService } from "./../../../../services/classes/notifications/notifications.service";
import { CredentialsService } from "./../../../authentication/credentials/credentials.service";
import { Component, OnInit } from "@angular/core";

const log = new Logger("Order details");
@Component({
  selector: "app-order-details",
  templateUrl: "./order-details.component.html",
  styleUrls: ["./order-details.component.css"],
})
export class OrderDetailsComponent implements OnInit {
  orderDetails: any = null;
  relatedProducts: any[] = [];
  constructor(
    private credentialsService: CredentialsService,
    private notifyService: NotificationsService,
    private router: Router,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    this.getOrderDetails();
  }

  getOrderDetails() {
    const orderDetails = JSON.parse(sessionStorage.getItem("orderDetails"));
    if (orderDetails !== null) {
      this.orderDetails = orderDetails;
    }
  }

  removeUnderscores(paymentMethod: string) {
    if (paymentMethod.includes("_")) {
      return paymentMethod.replace(/_/g, " ");
    } else {
      return paymentMethod;
    }
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
