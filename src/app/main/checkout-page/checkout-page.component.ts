import { ProductsService } from "./../../../services/data/products/products.service";
import { Order } from "./../../../services/classes/models/order";
import {
  OrdersService,
  PaymentMethod,
} from "./../../../services/data/orders/orders.service";
import { CartProduct } from "./../../../services/classes/models/product";
import { CartService } from "./../../../services/classes/cart/cart.service";
import { FormBuilder, Validators } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { finalize } from "rxjs/operators";
import { Logger } from "./../../../services/core/logger/logger.service";
import { Profile } from "./../../../services/classes/models/profile";
import { Router } from "@angular/router";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { ProfileService } from "./../../../services/data/profile/profile.service";
import {
  CredentialsService,
  Credentials,
} from "./../../authentication/credentials/credentials.service";
import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";

const log = new Logger("Checkout");

@Component({
  selector: "app-checkout-page",
  templateUrl: "./checkout-page.component.html",
  styleUrls: ["./checkout-page.component.css"],
})
export class CheckoutPageComponent implements OnInit {
  stage: number = 0;
  cardPayment = false;
  userProfile: Profile;
  cashPayment = false;
  relatedProducts: any[] = [];
  credentials: Credentials;
  isPageLoading = false;
  billingForm: FormGroup;
  profileInformation: Profile;
  carts: CartProduct[];
  wishlist: CartProduct[];
  cartTotal: any;
  reference = "";
  publicKey = environment.publicKey;
  userEmail: string;
  title: string;
  wishTotal: any;
  orderPayload: Order;
  paymentMethods = PaymentMethod;
  requiredDataComplete = false;
  differentAddress = false;

  constructor(
    private credentialsService: CredentialsService,
    private cartService: CartService,
    private profileService: ProfileService,
    private notifyService: NotificationsService,
    private router: Router,
    private productsService: ProductsService,
    private fb: FormBuilder,
    private ordersService: OrdersService
  ) {}

  ngOnInit() {
    this.reference = `ref-${Math.ceil(Math.random() * 10e13)}`;
    this.initBillingForm();
    this.getUserProfile();
    this.getCart();
    this.credentials = this.credentialsService.credentials;
    this.userEmail = this.credentials.email;
  }

  /**
   * If payment_method = mobile_money or card, send trxref instead of provider.
   *
   *
   * "payment_method": "mobile_money",
   *  "shipping_method": "door_delivery", (Cancelled)
   *   "total_shipping_fee": "500",
   *   "total_price": "10000",
   *   "bphoneno": "08138623302",
   *   "baddress": "12, house of money",
   *   "bcountry": "Naija",
   *   "bstate": "Lagos",
   *   "bcity": "Lagos",
   *   "phone": " 0242223344",
   *   "provider": "mtn"
   */

  initBillingForm() {
    this.billingForm = this.fb.group({
      payment_method: [""],
      total_shipping_fee: [""],
      total_price: [""],
      bphoneno: [
        "",
        [Validators.required, Validators.pattern("^((\\+233-?)|0)?[0-9]{10}$")],
      ],
      baddress: ["", Validators.required],
      bstate: ["", Validators.required],
      bcity: ["", Validators.required],
      different_address: [0],

      // If different address is selected
      sfullname: [""],
      semail: ["", Validators.email],
      sphoneno: [""],
      scity: [""],
      sstate: [""],
      saddress: [""],
    });
  }

  updateBillingForm(profileInfo: any) {
    const { userbilling } = profileInfo;
    if (userbilling !== null) {
      this.billingForm.patchValue({
        payment_method: null,
        total_shipping_fee: null,
        total_price: null,
        bphoneno: profileInfo.phoneno,
        baddress: profileInfo.userbilling.address1,
        bstate: profileInfo.userbilling.state1,
        bcity: profileInfo.userbilling.city1,
      });
    } else {
      this.billingForm.patchValue({
        payment_method: null,
        total_shipping_fee: null,
        total_price: null,
        bphoneno: profileInfo.phoneno,
      });
    }
  }

  nextStep(stage: number) {
    this.stage = stage;
  }

  getUserProfile() {
    this.isPageLoading = true;
    const profile$ = this.profileService.getUserProfile();
    profile$
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("profile: ", res);
            if (res.data) {
              this.updateBillingForm(res.data);
              this.profileInformation = res.data;
            }
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => log.debug("error: ", error)
      );
  }

  submitBillingInfo() {
    log.debug("billing: ", this.billingForm.value);
  }

  toggleShipping() {
    this.differentAddress = !this.differentAddress;
  }

  getCart() {
    this.cartService.cartUpdate.subscribe((res) => {
      // log.debug('res-cart: ', res);
      if (res["cartUpdate"] || res["listUpdate"]) {
        if (sessionStorage.getItem("cart")) {
          this.carts = JSON.parse(sessionStorage.getItem("cart"));
          this.cartTotal = JSON.parse(sessionStorage.getItem("cartTotal"));
        }

        if (sessionStorage.getItem("wishList")) {
          this.wishlist = JSON.parse(sessionStorage.getItem("wishList"));
          this.wishTotal = JSON.parse(sessionStorage.getItem("wishTotal"));
          // this.getProductsInWishlist();
        }
      } else {
        if (sessionStorage.getItem("cart")) {
          this.carts = JSON.parse(sessionStorage.getItem("cart"));
          this.cartTotal = JSON.parse(sessionStorage.getItem("cartTotal"));
        }

        if (sessionStorage.getItem("wishList")) {
          this.wishlist = JSON.parse(sessionStorage.getItem("wishList"));
          this.wishTotal = JSON.parse(sessionStorage.getItem("wishTotal"));
          // this.getProductsInWishlist();
        }
      }
    });

    this.collectCartItemsForOrderConfirmationPage();
  }

  selectCardPayment(e: any) {
    this.cardPayment = true;
    this.billingForm.patchValue({
      payment_method: "card",
    });
    this.cashPayment = false;
  }

  selectCashPayment(e: any) {
    this.cashPayment = true;
    this.billingForm.patchValue({
      payment_method: "cash_on_delivery",
    });
    this.cardPayment = false;
    // this.requiredDataComplete = true;

    if (!this.differentAddress) {
      const {
        payment_method,
        baddress,
        bstate,
        bcity,
        bphoneno,
        different_address,
      } = this.billingForm.value;

      this.orderPayload = {
        payment_method,
        total_shipping_fee: 15,
        total_price: this.cartTotal,
        bphoneno,
        baddress,
        bstate,
        bcity,
        different_address,
        ...this.orderPayload,
      };
    } else {
      const {
        payment_method,
        baddress,
        bstate,
        bcity,
        bphoneno,
        different_address,
        sfullname,
        semail,
        sphoneno,
        scity,
        sstate,
        saddress,
      } = this.billingForm.value;

      this.orderPayload = {
        payment_method,
        total_shipping_fee: 15,
        total_price: this.cartTotal,
        bphoneno,
        baddress,
        bstate,
        bcity,
        different_address,
        sfullname,
        semail,
        sphoneno,
        scity,
        sstate,
        saddress,
        ...this.orderPayload,
      };
    }

    log.debug("order-payload: ", this.orderPayload);
    this.sendOrder(this.orderPayload);
  }

  paymentInit() {
    console.log("Payment initialized");
  }

  paymentDone(ref: any) {
    this.title = "Payment successful";
    log.debug(this.title, ref);
    const { reference, transaction, trxref } = ref;
    this.orderPayload = {
      trxref,
    };
    // this.requiredDataComplete = true;
    this.cardPayment = false;
    this.cashPayment = false;

    if (!this.differentAddress) {
      const {
        payment_method,
        baddress,
        bstate,
        bcity,
        bphoneno,
        different_address,
      } = this.billingForm.value;

      this.orderPayload = {
        payment_method,
        total_shipping_fee: 15,
        total_price: this.cartTotal,
        bphoneno,
        baddress,
        bstate,
        bcity,
        different_address,
        ...this.orderPayload,
      };
    } else {
      const {
        payment_method,
        baddress,
        bstate,
        bcity,
        bphoneno,
        different_address,
        sfullname,
        semail,
        sphoneno,
        scity,
        sstate,
        saddress,
      } = this.billingForm.value;

      this.orderPayload = {
        payment_method,
        total_shipping_fee: 15,
        total_price: this.cartTotal,
        bphoneno,
        baddress,
        bstate,
        bcity,
        different_address,
        sfullname,
        semail,
        sphoneno,
        scity,
        sstate,
        saddress,
        ...this.orderPayload,
      };
    }
    log.debug("order-payload: ", this.orderPayload);
    this.sendOrder(this.orderPayload);
  }

  paymentCancel() {
    console.log("payment failed");
  }

  convertForPaystack(value: any) {
    return parseInt(value, 10) * 100;
  }

  sendOrder(payload: Order) {
    this.isPageLoading = true;
    const order$ = this.ordersService.sendOrders(payload);
    order$
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("order-res: ", res);
            this.cartService.clearCart();
            // this.notifyService.publishMessages(res.message, "success", 1);
            this.router.navigate(["/", "order-success"]);
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

  collectCartItemsForOrderConfirmationPage() {
    sessionStorage.setItem("newOrderDetails", JSON.stringify(this.carts));
    sessionStorage.setItem("cartTotal", this.cartTotal);
  }
}
