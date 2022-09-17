import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { Logger } from "./../../../services/core/logger/logger.service";
import { ProductsService } from "./../../../services/data/products/products.service";
import { Component, OnInit } from "@angular/core";

const log = new Logger("Create Account");
@Component({
  selector: "app-create-account",
  templateUrl: "./create-account.component.html",
  styleUrls: ["./create-account.component.css"],
})
export class CreateAccountComponent implements OnInit {
  relatedProducts: any[] = [];
  constructor(
    private productsService: ProductsService,
    private notifyService: NotificationsService
  ) {}

  ngOnInit() {}

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
