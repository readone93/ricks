import { Router } from "@angular/router";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { Logger } from "src/services/core/logger/logger.service";
import { ProductsService } from "./../../../services/data/products/products.service";
import { HomeService } from "./../../../services/data/home/home.service";
import {
  CredentialsService,
  Credentials,
} from "./../../authentication/credentials/credentials.service";
import { CartService } from "./../../../services/classes/cart/cart.service";
import { Component, OnInit } from "@angular/core";
import { CartProduct, Product } from "src/services/classes/models/product";

const log = new Logger("Landing");
@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.css"],
})
export class LandingComponent implements OnInit {
  credentials: Credentials;
  isLoggedIn: boolean;
  selectedProduct = null;
  carts: any[] = [];
  wishlist: CartProduct[] = [];
  wishTotal: number;
  cartTotal: number;
  wishListProductIds: number[] = [];
  color: string;
  allProducts: Product[];
  itemQuantity = 1;
  products: Product[];
  featuredProducts: Product[];
  topSellingProducts: Product[] = [];

  constructor(
    private cartService: CartService,
    private credentialsService: CredentialsService,
    private homeService: HomeService,
    private router: Router,
    private productsService: ProductsService,
    private notifyService: NotificationsService
  ) {}

  ngOnInit() {
    this.credentials = this.credentialsService.credentials;
    this.isLoggedIn = this.credentialsService.isAuthenticated();
    Promise.all([
      this.getProductsInWishlist(),
      this.getCart(),
      this.getProducts(),
    ]);
  }

  getProducts() {
    const products$ = this.productsService.getProducts();
    products$.subscribe(
      (res: any) => {
        if (res.error === false) {
          log.debug("res: ", res.data);
          if (res.data) {
            const { products, featuredProducts, bestsellerproducts } = res.data;

            this.products = products !== null ? products : [];
            if (this.products) {
              this.products.forEach((element: any) => {
                if (element.product_image) {
                  if (element.product_image.includes("|")) {
                    element.product_image = element.product_image.split("|");
                    element.product_image = element.product_image[0];
                  } else if (element.product_image.includes(",")) {
                    element.product_image = element.product_image.split(",");
                    element.product_image = element.product_image[0];
                  } else if (typeof element.product_image === "string") {
                    element.product_image = element.product_image;
                  } else {
                    element.product_image = element.product_image[0];
                  }
                }
              });
            }
            this.featuredProducts =
              featuredProducts !== null ? featuredProducts : [];
            if (this.featuredProducts) {
              this.featuredProducts.forEach((element: any) => {
                if (element.product_image) {
                  if (element.product_image.includes("|")) {
                    element.product_image = element.product_image.split("|");
                    element.product_image = element.product_image[0];
                  } else if (element.product_image.includes(",")) {
                    element.product_image = element.product_image.split(",");
                    element.product_image = element.product_image[0];
                  } else if (typeof element.product_image === "string") {
                    element.product_image = element.product_image;
                  } else {
                    element.product_image = element.product_image[0];
                  }
                }
              });
            }
            bestsellerproducts.forEach((element) => {
              if (element) {
                const product = element.product;
                if (product !== null) {
                  product["product_id"] = element.product_id;
                  this.topSellingProducts.push(product);
                }
              }
            });
            log.debug("top: ", this.topSellingProducts);
            this.topSellingProducts.forEach((element: any) => {
              if (element.product_image) {
                if (element.product_image.includes("|")) {
                  element.product_image = element.product_image.split("|");
                  element.product_image = element.product_image[0];
                } else if (element.product_image.includes(",")) {
                  element.product_image = element.product_image.split(",");
                  element.product_image = element.product_image[0];
                } else if (typeof element.product_image === "string") {
                  element.product_image = element.product_image;
                } else {
                  element.product_image = element.product_image[0];
                }
              }
            });
          }
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }

  assignAsSelectedProduct(
    product: Product,
    toCart: boolean,
    forDetails: boolean
  ) {
    log.debug("e: ", product);
    this.selectedProduct = product;
    if (product && toCart && !forDetails) {
      log.debug("for cart");
      if (product.in_stock === 1 || product.in_stock === true) {
        if (this.credentialsService.isAuthenticated()) {
          const { id, new_price } = this.selectedProduct;
          const payload: any = {
            product_id: id,
            price: new_price,
            quantity: this.itemQuantity,
          };
          log.debug("cart payload: ", payload);
          this.sendCartItemToServer(payload);
        } else {
          this.addToCart(this.selectedProduct);
        }
        document.getElementById("cartModalTrigger").click();
      } else {
        this.notifyService.publishMessages(
          "This product is currently out of stock",
          "warning",
          1
        );
      }
    } else if (product && !toCart && !forDetails) {
      log.debug("for wishlist");
      // this.addToWishlist(this.selectedProduct);
      if (!this.credentialsService.isAuthenticated()) {
        this.notifyService.publishMessages(
          "Log in to add a product to wishlist",
          "warning",
          1
        );
      } else {
        log.debug("to wishlist");
        const { id, new_price } = this.selectedProduct;
        const payload: any = {
          product_id: id,
          price: new_price,
          quantity: this.itemQuantity,
        };
        this.sendWishlistItemToServer(payload);
      }
    } else if (product && !toCart && forDetails) {
      log.debug("for details");
      this.viewProduct(product);
    }
  }

  fixQuantity() {
    if (this.itemQuantity <= 0) {
      this.itemQuantity = 1;
    }
  }

  viewProduct(product: any) {
    sessionStorage.setItem("product_details", JSON.stringify(product));
    this.router.navigate(["/product/" + product.id]);
  }

  addToCart(product: any, quantityToAdd?: number) {
    log.debug("product-to-add: ", product);
    if (quantityToAdd) {
      log.debug("with qty");
      this.cartService.addToCart(product, quantityToAdd);
    } else {
      const { id, new_price } = this.selectedProduct;
      this.selectedProduct["product_id"] = id;
      this.selectedProduct["price"] = new_price;
      this.cartService.addToCart(this.selectedProduct, this.itemQuantity);
      this.notifyService.publishMessages("Product added to cart", "success", 1);
    }
    this.getCart();
  }

  getProductsInWishlist() {
    if (this.isLoggedIn) {
      const allProductsInWishlist = JSON.parse(
        sessionStorage.getItem("wishList")
      );
      if (allProductsInWishlist !== null) {
        this.wishListProductIds = allProductsInWishlist.map(
          (product: any) => product.product_id
        );
      }
    }
  }

  addToWishlist(product: any, quantityToAdd?: number) {
    log.debug("new-in-wishlist: ", product);
    this.cartService.addToWishList(product, quantityToAdd);
    document.getElementById("wishlistModalTrigger").click();
    this.getCart();
  }

  getCart() {
    this.cartService.cartUpdate.subscribe((res) => {
      // log.debug('res-cart: ', res);
      if (res["cartUpdate"] || res["listUpdate"]) {
        if (sessionStorage.getItem("cart")) {
          // this.carts.forEach((element) => {
          //   if (element.image) {
          //     if (element.image.includes("|")) {
          //       element.image = element.image.split("|");
          //       element.image = element.image[0];
          //     } else if (element.image.includes(",")) {
          //       element.image = element.image.split(",");
          //       element.image = element.image[0];
          //     } else if (typeof element.image === "string") {
          //       element.image = element.image;
          //     } else {
          //       element.image = element.image[0];
          //     }
          //   }
          // });
          this.carts = JSON.parse(sessionStorage.getItem("cart"));
          this.cartTotal = JSON.parse(sessionStorage.getItem("cartTotal"));
        }

        if (sessionStorage.getItem("wishList")) {
          this.wishlist = JSON.parse(sessionStorage.getItem("wishList"));
          this.wishTotal = JSON.parse(sessionStorage.getItem("wishTotal"));
          this.getProductsInWishlist();
        }
      } else {
        if (sessionStorage.getItem("cart")) {
          this.carts = JSON.parse(sessionStorage.getItem("cart"));
          this.cartTotal = JSON.parse(sessionStorage.getItem("cartTotal"));
        }

        if (sessionStorage.getItem("wishList")) {
          this.wishlist = JSON.parse(sessionStorage.getItem("wishList"));
          this.wishTotal = JSON.parse(sessionStorage.getItem("wishTotal"));
          this.getProductsInWishlist();
        }
      }
    });
  }

  sendCartItemToServer(payload: CartProduct) {
    const cartItem$ = this.productsService.addToCart(payload);
    cartItem$.subscribe(
      (res: any) => {
        if (res.error === false) {
          if (res.data !== true) {
            const cartItem = res.data;
            const cartId = cartItem.id;
            cartItem["cartId"] = cartId;
            cartItem["price"] = cartItem.price;
            cartItem["quantity_ordered"] = cartItem.quantity;
            cartItem["product_name"] = this.selectedProduct.product_name;
            cartItem["brand_name"] = this.selectedProduct.production_company;
            cartItem["product_image"] = this.selectedProduct.product_image;
            cartItem[
              "product_description"
            ] = this.selectedProduct.product_description;
            this.addToCart(cartItem, cartItem.quantity);
            this.notifyService.publishMessages(res.message, "success", 1);
          } else {
            const { id } = this.selectedProduct;
            this.selectedProduct["product_id"] = id;
            this.addToCart(this.selectedProduct);
            // this.notifyService.publishMessages(res.message, "success", 1);
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

  sendWishlistItemToServer(payload: CartProduct) {
    log.debug("wishlist-payload: ", payload);

    const wishlist$ = this.productsService.addToWishlist(payload);
    wishlist$.subscribe((res: any) => {
      if (res.error === false) {
        const wishlistItem = res.data;
        wishlistItem["wishlistId"] = wishlistItem.id;
        wishlistItem["new_price"] = wishlistItem.price;
        wishlistItem["quantity_ordered"] = this.itemQuantity;
        wishlistItem["product_name"] = this.selectedProduct.product_name;
        wishlistItem["brand_name"] = this.selectedProduct.production_company;
        wishlistItem["image"] = this.selectedProduct.product_image;
        wishlistItem[
          "product_description"
        ] = this.selectedProduct.product_description;
        this.addToWishlist(wishlistItem, 1);
        // log.debug("w-item: ", wishlistItem);
        this.notifyService.publishMessages(res.message, "success", 1);
      } else {
        this.notifyService.publishMessages(res.message, "danger", 1);
      }
    });
  }

  restoreCartItemQuantity() {
    const cartItemCounter: any = document.getElementById("cartItemQuantity");
    cartItemCounter.value = 1;
  }

  goToCartPage() {
    document.getElementById("cartModalCloseBtn").click();
    this.router.navigateByUrl("/cart");
  }

  goToWishlist() {
    document.getElementById("wishlistModalCloseBtn").click();
    this.router.navigateByUrl("/wishlist");
  }
}
