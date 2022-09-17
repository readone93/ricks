import { ProductsService } from "./../../../../services/data/products/products.service";
import { Logger } from "./../../../../services/core/logger/logger.service";
import { finalize } from "rxjs/operators";
import { ProfileService } from "./../../../../services/data/profile/profile.service";
import { NotificationsService } from "./../../../../services/classes/notifications/notifications.service";
import {
  Credentials,
  CredentialsService,
} from "./../../../authentication/credentials/credentials.service";
import { Component, OnInit } from "@angular/core";

const log = new Logger("Profile");

@Component({
  selector: "app-account",
  templateUrl: "./account.component.html",
  styleUrls: ["./account.component.css"],
})
export class AccountComponent implements OnInit {
  credentials: Credentials;
  isPageLoading = false;
  profile: Credentials = null;

  private relatedProducts: any[] = [];

  constructor(
    private credentialsService: CredentialsService,
    private notifyService: NotificationsService,
    private productsService: ProductsService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.credentials = this.credentialsService.credentials;
    this.getProfileInformation();
  }

  getProfileInformation() {
    this.isPageLoading = true;
    const profileInfo$ = this.profileService.getUserProfile();
    profileInfo$
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            this.profile = res.data;
            log.debug("profile: ", res);
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => log.debug("error: ", error)
      );
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
