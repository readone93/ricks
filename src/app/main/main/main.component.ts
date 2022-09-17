import { CartProduct } from "./../../../services/classes/models/product";
import { Product } from "src/services/classes/models/product";
import { ProductsService } from "./../../../services/data/products/products.service";
import { CategoriesService } from "./../../../services/data/categories/categories.service";
import { SocialSignup } from "./../../../services/classes/models/social-signup";
import { Router, NavigationEnd } from "@angular/router";
import { CartService } from "./../../../services/classes/cart/cart.service";
import { filter, finalize } from "rxjs/operators";
import { Logger } from "./../../../services/core/logger/logger.service";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { AuthService } from "./../../../services/data/auth/auth.service";
import {
  Credentials,
  CredentialsService,
} from "./../../authentication/credentials/credentials.service";
import { Component, OnInit } from "@angular/core";
import { Signup } from "src/services/classes/models/signup";
import { Login } from "src/services/classes/models/login";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  GoogleLoginProvider,
  AuthService as SocialAuthService,
} from "angular-6-social-login";
import { Category } from "src/services/classes/models/category";
import { isNull } from "@angular/compiler/src/output/output_ast";
import { environment } from "src/environments/environment";

const log = new Logger("Main");
@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.css"],
})
export class MainComponent implements OnInit {
  searchShow = false;
  iisCategoriesLoading = false;
  isPageLoading = false;
  categories: Category[] = [];
  searchHide = true;
  activeBtn = true;
  isLoading = false;
  isLoggedIn = false;
  credentials: Credentials;
  loginForm: FormGroup;
  signUpForm: FormGroup;
  textType: boolean;
  passwordType: boolean;
  isSocialLoginLoading = false;
  showText: boolean;
  wishlist: any[] = [];
  carts: any[] = [];
  currentRoute: any;
  cartTotal: any = null;
  wishTotal: any = null;
  selectedCatID: any;
  subCat: any[] = [];
  subcategories: any[];
  wishListProductIds: any[] = [];
  holder: any;
  dropped: boolean;
  childCategories: any[] = [];
  childCat: any[] = [];
  constructor(
    private credentialsService: CredentialsService,
    private authService: AuthService,
    private notifyService: NotificationsService,
    private cartService: CartService,
    private angular6Auth: SocialAuthService,
    private router: Router,
    private fb: FormBuilder,
    private categoryService: CategoriesService,
    private productsService: ProductsService
  ) {
    router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  ngOnInit() {
    this.initLoginForm();
    this.initSignUpForm();
    this.getCategoriesToSetupForMain();
    this.getCart();
    this.isLoggedIn = this.credentialsService.isAuthenticated();
    if (this.isLoggedIn === true) {
      this.credentials = this.credentialsService.credentials;
    } else {
      this.isLoggedIn = false;
    }
    this.fbLibrary();
    // this.getCategories();
  }

  setupMain() {
    this.categories = JSON.parse(localStorage.getItem("categories"));
    this.subCat = JSON.parse(localStorage.getItem("subCat"));
    this.childCat = JSON.parse(localStorage.getItem("childCat"));

    log.debug("main done!");
  }

  search(event: any) {
    const value = event.target.value;
    if (value === "") {
      this.notifyService.publishMessages(
        "Please enter a value to search",
        "warning",
        1
      );
    } else {
      log.debug("search: ", value);
      sessionStorage.setItem("searchParam", value);
      if (this.currentRoute !== "/search") {
        this.router.navigate(["/", "search"]);
      } else {
        this.router.navigateByUrl("/").then(() => {
          this.router.navigate(["/", "search"]);
        });
      }
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

  selectActiveBtn(value: boolean) {
    this.activeBtn = value;
    if (!value) {
      window.open("https://aduaba-merchant.vercel.app", "_blank");
      this.activeBtn = true;
    }
  }

  /**
   * Payload Sample:
   * "firstname": "Joshua",
   * "lastname": "Gbayi",
   * "email": "privatesaint01@gmail.com",
   * "phoneno": "08138623301",
   * "password": "Password",
   * "role": "vendor", (For Vendor)
   * "vendor_no": "122de" (For Vendor)
   */

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

  showSearch() {
    this.searchShow = true;
    this.searchHide = false;
  }
  closeSearch() {
    this.searchShow = false;
    this.searchHide = true;
  }

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
              // this.sendCartItemsToServer();
              this.notifyService.publishMessages(res.message, "success", 1);
              const cart = JSON.parse(sessionStorage.getItem("cart"));
              if (Array.isArray(cart)) {
                if (cart.length > 0) {
                  this.sendCartItemsToServer();
                }
              } else if (cart !== null) {
                this.sendCartItemsToServer();
              }

              this.getCartItemsFromDB();
              this.getWishlistItemsFromDB();
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

  logout() {
    this.credentialsService.setCredentials();
    this.isLoggedIn = false;
    this.cartService.clearCart();
    this.cartService.clearWishlist();
    // document.getElementById("dropdownMenu2").click();
    this.getCart();
    this.router.navigate(["/"]);
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
    } else if (platform === "facebook") {
      // Facebook Auth
      window["FB"].login(
        (response: any) => {
          if (response.authResponse) {
            const { accessToken } = response.authResponse;
            log.debug("res: ", response.authResponse);
            // Send stuff to API here
            const payload: SocialSignup = {
              token: accessToken,
              provider: "facebook",
            };
            this.sendPayloadToSocialSignUpEndpoint(payload, formType);
          } else {
            log.debug("User login failed");
            this.notifyService.publishMessages(
              "Facebook login failed",
              "danger",
              1
            );
          }
        },
        { scope: "email" }
      );
    }
  }

  sendPayloadToSocialSignUpEndpoint(payload: SocialSignup, formType: string) {
    this.isSocialLoginLoading = true;
    const signUp$ = this.authService.socialSignUp(payload);
    signUp$.subscribe(
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
            this.credentials = this.credentialsService.credentials;
            this.isLoggedIn = true;
            const cart: Product[] = JSON.parse(sessionStorage.getItem("cart"));
            if (Array.isArray(cart)) {
              if (cart.length > 0) {
                this.sendCartItemsToServer();
              }
            } else if (cart !== null) {
              this.sendCartItemsToServer();
            }
            if (formType === "loginForm") {
              document.getElementById("loginModalCloseBtn").click();
            } else {
              document.getElementById("registerModalCloseBtn").click();
            }
            this.getCartItemsFromDB();
            this.getWishlistItemsFromDB();
            this.isSocialLoginLoading = false;
          } else {
            this.notifyService.publishMessages(
              "You are not authorised to login, kindly create an account",
              "warning",
              1
            );
            this.isSocialLoginLoading = false;
            return;
          }
        }
      },
      (error) => log.debug("error: ", error)
    );
  }

  fbLibrary() {
    (window as any).fbAsyncInit = function () {
      window["FB"].init({
        appId: environment.fbAppId,
        cookie: true,
        xfbml: true,
        status: true,
        version: "v3.1",
      });
      window["FB"].AppEvents.logPageView();
    };

    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js["src"] = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }

  getCategories() {
    const categories$ = this.categoryService.getAllCategories();
    categories$.subscribe(
      (res: any) => {
        if (res.error === false) {
          log.debug("cats: ", res.data);
          this.categories = res.data;
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => {
        log.debug("error: ", error);
      }
    );
  }

  getCategoriesToSetupForMain() {
    this.iisCategoriesLoading = true;
    const savedCategories = localStorage.getItem("categories");
    const savedSubCategories = localStorage.getItem("subCat");
    if (savedCategories === null || savedSubCategories === null) {
      const categoriesForMain$ = this.productsService.getProducts();
      categoriesForMain$.subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("cat-res: ", res.data);
            const { categories, subcategories } = res.data;
            this.categories = categories;
            if (categories) {
              localStorage.setItem("categories", JSON.stringify(categories));
            }
            if (subcategories) {
              localStorage.setItem("subCat", JSON.stringify(subcategories));
            }
            this.setupMain();
            this.iisCategoriesLoading = false;
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
            this.iisCategoriesLoading = false;
          }
        },
        (error) => {
          log.debug("error: ", error);
          this.iisCategoriesLoading = false;
        }
      );
    } else {
      this.setupMain();
      this.iisCategoriesLoading = false;
    }
  }

  showMenuDetails(menuItem: Category) {
    log.debug("menu: ", menuItem);
  }

  getCart() {
    this.cartService.cartUpdate.subscribe((res) => {
      log.debug("res-cart: ", res);
      if (res["cartUpdate"] || res["listUpdate"]) {
        if (sessionStorage.getItem("cart")) {
          this.carts = JSON.parse(sessionStorage.getItem("cart"));
          // this.carts.forEach((element) => {
          //   if (element.image.includes("|")) {
          //     element.image = element.image.split("|");
          //     element.image = element.image[0];
          //   } else if (element.image.includes(",")) {
          //     element.image = element.image.split(",");
          //     element.image = element.image[0];
          //   } else if (typeof element.image === "string") {
          //     element.image = element.image;
          //   } else {
          //     element.image = element.image[0];
          //   }
          // });
          this.carts = JSON.parse(sessionStorage.getItem("cart"));
          this.cartTotal = JSON.parse(sessionStorage.getItem("cartTotal"));
        }

        if (sessionStorage.getItem("wishList")) {
          this.wishlist = JSON.parse(sessionStorage.getItem("wishList"));
          this.wishTotal = JSON.parse(sessionStorage.getItem("wishTotal"));
          // this.getProductsInWishlist();
        }

        if (res.cartUpdate) {
          // setTimeout(() => {
          //   document.getElementById("dropdownMenuButton2").click();
          // }, 100);
        } else {
          // setTimeout(() => {
          //   document.getElementById("dropdownMenuButton3").click();
          // }, 100);
        }
      } else {
        if (sessionStorage.getItem("cart")) {
          this.carts = JSON.parse(sessionStorage.getItem("cart"));
          log.debug("here: ", this.carts);
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
      const payload = {
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
                element.product["brand_name"] =
                  element.product.production_company;
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

  getWishlistItemsFromDB() {
    const wishlistItems$ = this.productsService.getWishlistItems();
    wishlistItems$.subscribe(
      (res: any) => {
        if (res.error === false || res.success === true) {
          const wishlistItems: any[] = res.data;
          log.debug("w-items: ", wishlistItems);
          if (wishlistItems !== null) {
            wishlistItems.forEach((element) => {
              if (element.product !== null) {
                if (element.product.product_image.includes("|")) {
                  element.product.image = element.product.product_image.split(
                    "|"
                  );
                  element.product.image = element.product.product_image[0];
                } else {
                  element.product.image = element.product.product_image;
                }

                element.product["product_id"] = element.product.id;
                element.product["wishlistId"] = element.id;
                element.product["price"] = element.price;
                element.product["quantity_ordered"] = element.quantity;
                element.product["brand_name"] =
                  element.product.production_company;
                this.cartService.addToWishList(element.product, 1);
                log.debug("added to wishlist in main: ", element.product);
              }
            });
          } else {
            log.debug("nothing in wishlist from server");
            location.reload();
          }
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }

  drillDown(details) {
    sessionStorage.setItem("details", JSON.stringify(details));
    this.dropped = false;
  }

  updateCategories(id) {
    if (this.holder != id) {
      log.debug("subcat: ", this.subCat);
      this.selectedCatID = id;
      log.debug("ID: ", id);
      this.dropped = true;
      this.subcategories = [];
      this.subCat.forEach((element) => {
        if (element.cat_id == id) {
          this.subcategories.push(element);
        }
      });
      log.debug("sub: ", this.subcategories);
      this.holder = id;
    } else {
      this.dropped = false;
      this.holder = "";
      document
        .getElementById("dropdownMenuButton")
        .addEventListener("click", (e) => {
          e.stopPropagation();
        });
    }
  }

  alternateDropped() {
    if (this.dropped === true) {
      this.dropped = false;
      this.holder = "";
      document
        .getElementById("dropdownMenuButton")
        .addEventListener("click", (e) => {
          e.stopPropagation();
        });
    }
  }

  openNav() {
    document.getElementById("mySidebar").style.width = "250px";
  }

  closeNav() {
    document.getElementById("mySidebar").style.width = "0";
  }
}
