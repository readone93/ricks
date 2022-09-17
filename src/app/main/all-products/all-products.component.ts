import { finalize } from "rxjs/operators";
import { Logger } from "./../../../services/core/logger/logger.service";
import { CredentialsService } from "./../../authentication/credentials/credentials.service";
import { Router } from "@angular/router";
import { CartService } from "./../../../services/classes/cart/cart.service";
import { ProductsService } from "src/services/data/products/products.service";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { Component, OnInit } from "@angular/core";
import { LoaderService } from "src/services/classes/loader/loader.service";
import { CartProduct, Product } from "src/services/classes/models/product";
import { VendorService } from "src/services/data/vendor/vendor.service";
import { pipe } from "rxjs";

const log = new Logger("All-Ps");
@Component({
  selector: "app-all-products",
  templateUrl: "./all-products.component.html",
  styleUrls: ["./all-products.component.css"],
})
export class AllProductsComponent implements OnInit {
  categoriesWithProducts: any[] = [];
  isLoading = false;

  carts: any[] = [];
  wishlist: CartProduct[] = [];
  wishTotal: number;
  cartTotal: number;
  wishListProductIds: number[] = [];
  vendorId: number;
  vendorDetails: any = null;
  vendorProducts: any[] = [];
  selectedProduct: any = null;
  itemQuantity = 1;

  isLoggedIn = false;
  constructor(
    private notifyService: NotificationsService,
    private productsService: ProductsService,
    private cartService: CartService,
    private router: Router,
    private credentialsService: CredentialsService,

    private vendorsService: VendorService,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.getAllProductsFromCategories();
    this.isLoggedIn = this.credentialsService.isAuthenticated();
  }

  getAllProductsFromCategories() {
    this.isLoading = true;
    const products$ = this.productsService.getProductsWithCategories();
    products$
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("prods: ", res.data);
            this.categoriesWithProducts = res.data;
            if (this.categoriesWithProducts) {
              this.categoriesWithProducts.forEach((element) => {
                log.debug("elem: ", element.cat_name, element.product);
                if (element.product.length > 0) {
                  element.product.forEach((product: any) => {
                    if (product.product_image.includes("|")) {
                      product.product_image = product.product_image.split("|");
                      product.product_image = product.product_image[0];
                    } else if (product.product_image.includes(",")) {
                      product.product_image = product.product_image.split(",");
                      product.product_image = product.product_image[0];
                    } else if (typeof product.product_image === "string") {
                      product.product_image = product.product_image;
                    } else {
                      product.product_image = product.product_image[0];
                    }
                  });
                } else {
                  log.debug("no product");
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
    forDetails = false
  ) {
    log.debug("e: ", product);
    this.selectedProduct = product;
    if (toCart && !forDetails) {
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
        // document.getElementById("cartModalTrigger").click();
      } else {
        this.notifyService.publishMessages(
          "This product is currently out of stock",
          "warning",
          1
        );
      }
    } else if (!toCart && !forDetails) {
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
    } else if (!toCart && forDetails) {
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
    // document.getElementById("wishlistModalTrigger").click();
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
    this.isLoading = true;
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
            this.isLoading = false;
          } else {
            const { id } = this.selectedProduct;
            this.selectedProduct["product_id"] = id;
            this.addToCart(this.selectedProduct);
            // this.notifyService.publishMessages(res.message, "success", 1);
            this.isLoading = false;
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

  // restoreCartItemQuantity() {
  //   const cartItemCounter: any = document.getElementById("cartItemQuantity");
  //   cartItemCounter.value = 1;
  // }

  goToVendor() {
    window.open("https://vendor.aduabafresh.com/#/", "_blank");
  }
}
