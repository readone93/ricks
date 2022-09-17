import { Router } from "@angular/router";
import { Logger } from "./../../../services/core/logger/logger.service";
import { ProductsService } from "./../../../services/data/products/products.service";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { Component, OnInit } from "@angular/core";
import { RecommendedProduct } from "src/services/classes/models/recommended-product";

const log = new Logger("Payment");
@Component({
  selector: "app-payment-complete",
  templateUrl: "./payment-complete.component.html",
  styleUrls: ["./payment-complete.component.css"],
})
export class PaymentCompleteComponent implements OnInit {
  relatedProducts: any[] = [];
  similarProducts = false;
  cartTotal: any;
  carts: any[] = [];
  constructor(
    private notifyService: NotificationsService,
    private productsService: ProductsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.collectOrderDetailsFromSS();
  }

  collectOrderDetailsFromSS() {
    const orderDetails = JSON.parse(sessionStorage.getItem("newOrderDetails"));
    const total = JSON.parse(sessionStorage.getItem("cartTotal"));
    if (this.carts === null) {
      this.router.navigate(["/"]);
    } else {
      this.carts = orderDetails;
    }
  }
}
