import { RecommendedProduct } from "./../../../services/classes/models/recommended-product";
import { AuthService } from "./../../../services/data/auth/auth.service";
import {
  CredentialsService,
  Credentials,
} from "./../../authentication/credentials/credentials.service";
import { Logger } from "./../../../services/core/logger/logger.service";
import { Router } from "@angular/router";
import { NotificationsService } from "src/services/classes/notifications/notifications.service";
import { ProductsService } from "./../../../services/data/products/products.service";
import { CartService } from "./../../../services/classes/cart/cart.service";
import { Component, OnInit } from "@angular/core";
import { CartProduct, Product } from "src/services/classes/models/product";
import { finalize } from "rxjs/operators";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Signup } from "src/services/classes/models/signup";
import { Login } from "src/services/classes/models/login";
import { SocialSignup } from "src/services/classes/models/social-signup";
import {
  GoogleLoginProvider,
  AuthService as SocialAuthService,
} from "angular-6-social-login";

const log = new Logger("Cart-Page");
@Component({
  selector: "app-cart-page",
  templateUrl: "./cart-page.component.html",
  styleUrls: ["./cart-page.component.css"],
})
export class CartPageComponent implements OnInit {
  carts: any[] = [];
  wishlist: Product[] = [];
  wishTotal: number;
  isPageLoading = false;
  cartTotal: string;
  totalShippingFee: any;
  isLoggedIn = false;
  credentials: Credentials;
  isLoading = false;
  loginForm: FormGroup;
  signUpForm: FormGroup;
  textType: boolean;
  passwordType: boolean;
  isSocialLoginLoading = false;
  showText: boolean;
  activeBtn = true;
  selectedProduct: Product;
  selectedProductIndex: number;
  deliveryFee = 15;
  relatedProducts: any[] = [];
  similarProducts = false;

  constructor(
    private cartService: CartService,
    private productsService: ProductsService,
    private notifyService: NotificationsService,
    private credentialsService: CredentialsService,
    private fb: FormBuilder,
    private angular6Auth: SocialAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initLoginForm();
    this.initSignUpForm();

    this.getCart();
    this.cartTotal = sessionStorage.getItem("cartTotal");
    this.isLoggedIn = this.credentialsService.isAuthenticated();

    this.getRecommendedProductPayload();
  }

  getRecommendedProductPayload() {
    const productDetails = JSON.parse(sessionStorage.getItem("searchResult"));
    if (productDetails !== null) {
      const { cat_id, sub_cat_id, id } = productDetails[0];
      if (cat_id !== null && sub_cat_id !== null && id !== null) {
        const payload = {
          cat_id: parseInt(cat_id, 10),
          sub_cat_id: parseInt(sub_cat_id, 10),
          product_id: parseInt(id, 10),
        };
        this.getRecommendedProducts(payload);
      } else {
        this.getRecommendedProducts({});
      }
    } else {
      this.getRecommendedProducts({});
    }
  }

  showPassword() {
    this.passwordType = !this.passwordType;
    this.showText = !this.showText;
  }

  initLoginForm() {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }

  initSignUpForm() {
    this.signUpForm = this.fb.group({
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      email: ["", [Validators.email, Validators.required]],
      phoneno: [
        "",
        [Validators.required, Validators.pattern("^((\\+233-?)|0)?[0-9]{10}$")],
      ],
      password: ["", Validators.required],
      role: ["customer"],
    });
  }

  selectActiveBtn(value: boolean) {
    this.activeBtn = value;
    if (!value) {
      window.open("https://aduaba-merchant.vercel.app", "_blank");
      this.activeBtn = true;
    }
  }

  // getCart() {
  //   this.isPageLoading = true;
  //   const cartItems$ = this.productsService.getCartItems();
  //   cartItems$
  //     .pipe(
  //       finalize(() => {
  //         this.isPageLoading = false;
  //       })
  //     )
  //     .subscribe(
  //       (res: any) => {
  //         if (res.error === false) {
  //           log.debug("cart: ", res.data);
  //           this.carts = res.data;
  //         } else {
  //           this.notifyService.publishMessages(res.message, "danger", 1);
  //         }
  //       },
  //       (error) => log.debug("error: ", error)
  //     );
  // }

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
  }

  assignAsSelectedProduct(product: Product, productIndex: number) {
    this.selectedProduct = product;
    this.selectedProductIndex = productIndex;
  }

  deleteItemFromCart(product: any, index: number) {
    if (this.credentialsService.isAuthenticated()) {
      const itemToDelete$ = this.productsService.deleteCartItem(product.cartId);
      itemToDelete$.subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("res: ", res);
            this.cartService.removeFromCart(index);
            this.notifyService.publishMessages(res.message, "success", 1);
            document.getElementById("cartModalCloseBtn").click();
            this.getCart();
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => log.debug("error: ", error)
      );
    } else {
      this.cartService.removeFromCart(index);
      document.getElementById("cartModalCloseBtn").click();
    }
  }

  checkoutProduct() {
    if (this.isLoggedIn) {
      this.router.navigate(["/", "check-out"]);
    } else {
      this.notifyService.publishMessages(
        "You have to be logged in to proceed",
        "warning",
        1
      );
      document.getElementById("openLoginModal").click();
    }
  }

  /* Auth Matters */
  signUp(payload: Signup) {
    this.isLoading = true;
    const signUp$ = this.authService.signUp(payload);
    signUp$
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("signup: ", res);
            this.signUpForm.reset();
            document.getElementById("registerModalCloseBtn").click();
            document.getElementById("openConfirmEmailModal").click();
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => {
          log.debug("error: ", error);
        }
      );
  }

  login(payload: Login) {
    this.isPageLoading = true;
    const login$ = this.authService.login(payload);
    login$
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("login res: ", res);
            const { user } = res.data;
            if (user.roles[0].name === "customer") {
              const { accessToken, user } = res.data;
              const userRole = user.roles[0].name;
              const credentials: Credentials = {
                accessToken,
                userRole,
                ...user,
              };
              this.credentialsService.setCredentials(credentials);
              this.loginForm.reset();
              this.credentials = this.credentialsService.credentials;
              this.isLoggedIn = true;
              const cart = JSON.parse(sessionStorage.getItem("cart"));
              if (Array.isArray(cart)) {
                if (cart.length > 0) {
                  this.sendCartItemsToServer();
                }
              } else if (cart !== null) {
                this.sendCartItemsToServer();
              }
              this.notifyService.publishMessages(res.message, "success", 1);
              this.getCartItemsFromDB();
              // this.getWishlistItemsFromDB(this.credentials.id);
              document.getElementById("loginModalCloseBtn").click();
            } else {
              this.notifyService.publishMessages(
                "You are not authorised to login, kindly create an account",
                "warning",
                1
              );
              return;
            }
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => {
          log.debug("error: ", error);
        }
      );
  }

  formatCartItems(cartItem: any) {
    // const credentials = this.credentialsService.credentials;
    // const user_id = credentials.id;
    const { id, unit_price, quantity_ordered, color } = cartItem;
    return {
      product_id: id,
      quantity: quantity_ordered,
      price: unit_price,
      color,
    };
  }

  // For immediately after login
  sendCartItemsToServer() {
    const cart: Product[] = JSON.parse(sessionStorage.getItem("cart"));
    if (cart !== null) {
      const cartsArray: any[] = cart.map((cartItem: any) => {
        return this.formatCartItems(cartItem);
      });
      const payload: any = {
        carts: [...cartsArray],
      };
      log.debug("cart to send: ", payload);

      const cartPayload$ = this.productsService.transferToCart(payload);
      cartPayload$.subscribe(
        (res: any) => {
          log.debug("cart after login: ", res);
          if (res.error === false) {
            log.debug("cart after login: ", res.data);
            this.notifyService.publishMessages(res.message, "success", 1);
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => {
          log.debug("error: ", error);
        }
      );
    } else {
      return;
    }
  }

  getCartItemsFromDB() {
    const cartItemsFromDB$ = this.productsService.getCartItems();
    cartItemsFromDB$.subscribe(
      (res: any) => {
        if (res.error === false) {
          const cartItems: any[] = res.data;
          log.debug("res: ", res.data);
          if (cartItems !== null) {
            cartItems.forEach((element) => {
              if (element.product !== null) {
                if (element.product.product_image.includes("|")) {
                  element.product.product_image = element.product.product_image.split(
                    "|"
                  );
                  element.product.product_image =
                    element.product.product_image[0];
                } else {
                  element.product.product_image = element.product.product_image;
                }

                element.product["product_id"] = element.product.id;
                element.product["cartId"] = element.id;
                element.product["price"] = element.price;
                element.product["quantity_ordered"] = element.quantity;
                this.cartService.addToCart(element.product, element.quantity);
                log.debug("added to cart in main: ", element.product);
              }
            });
          } else {
            log.debug("nothing in cart from server");
          }
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }

  // Google Auth
  public loginWithSocialAuth(platform: string, formType: string) {
    let socialPlatformProvider;
    if (platform === "google") {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
      this.angular6Auth
        .signIn(socialPlatformProvider)
        .then((user: any) => {
          if (user) {
            log.debug("user: ", user);
            if (user["token"] && user["provider"]) {
              const { token, provider } = user;
              // Send token to Aduaba API
              const payload: SocialSignup = { token, provider };
              this.sendPayloadToSocialSignUpEndpoint(payload, formType);
            }
          }
        })
        .catch((error: any) => log.debug(error));
    }
  }

  sendPayloadToSocialSignUpEndpoint(payload: SocialSignup, formType: string) {
    this.isSocialLoginLoading = true;
    const signUp$ = this.authService.socialSignUp(payload);
    signUp$
      .pipe(
        finalize(() => {
          this.isSocialLoginLoading = false;
        })
      )
      .subscribe((res: any) => {
        if (res.error === false) {
          log.debug("login res: ", res);
          const { user } = res.data;
          if (user.roles[0].name === "customer") {
            const { accessToken, user } = res.data;
            const userRole = user.roles[0].name;
            const credentials: Credentials = {
              accessToken,
              userRole,
              ...user,
            };
            this.credentialsService.setCredentials(credentials);
            this.credentials = this.credentialsService.credentials;
            this.isLoggedIn = true;
            const cart = JSON.parse(sessionStorage.getItem("cart"));
            if (Array.isArray(cart)) {
              if (cart.length > 0) {
                this.sendCartItemsToServer();
              }
            } else if (cart !== null) {
              this.sendCartItemsToServer();
            }
            this.getCartItemsFromDB();
            // this.getWishlistItemsFromDB();
            if (formType === "loginForm") {
              document.getElementById("loginModalCloseBtn").click();
            } else {
              document.getElementById("registerModalCloseBtn").click();
            }
          } else {
            this.notifyService.publishMessages(
              "You are not authorised to login, kindly create an account",
              "warning",
              1
            );
            return;
          }
        }
      });
  }

  submitLoginForm() {
    log.debug("login: ", this.loginForm.value);
    const payload = this.loginForm.value;
    this.login(payload);
  }

  submitSignUpForm() {
    log.debug("signUp: ", this.signUpForm.value);
    const payload = this.signUpForm.value;
    this.signUp(payload);
  }

  convert(value: any) {
    return Number(value);
  }

  increaseCartProductCount(product: any) {
    if (!this.isLoggedIn) {
      this.cartService.addToCart(product, 1);
      this.getCart();
      this.notifyService.publishMessages(
        "Product in cart updated",
        "success",
        1
      );
    } else {
      this.updateProductInCart(product);
    }
  }

  // ToDo: ask Josh how we intend to reduce cart count on the server
  reduceCartProductCount(product: any) {
    this.cartService.reduceQuantity(product, 1);
    this.getCart();
    this.notifyService.publishMessages("Product in cart updated", "success", 1);
  }

  updateProductInCart(product: CartProduct) {
    const { product_id, cartId, quantity_ordered, unit_price } = product;
    const payload = {
      product_id,
      price: unit_price,
      quantity: quantity_ordered,
    };
    const update$ = this.productsService.updateCart(cartId, payload);
    update$.subscribe(
      (res: any) => {
        if (res.error === false) {
          log.debug("cart-update: ", res);
          this.cartService.addToCart(product, 1);
          this.getCart();
          this.notifyService.publishMessages(
            "Product in cart updated",
            "success",
            1
          );
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }

  getRecommendedProducts(payload: RecommendedProduct) {
    const productDetails$ = this.productsService.getRecommendedProducts(
      payload
    );
    productDetails$.subscribe(
      (res: any) => {
        if (res.error === false) {
          if (res.data) {
            this.relatedProducts = res.data.slice(0, 4);
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
