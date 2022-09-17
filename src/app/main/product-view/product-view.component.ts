import { Params } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { ProductsService } from "./../../../services/data/products/products.service";
import { CartService } from "./../../../services/classes/cart/cart.service";
import { Logger } from "./../../../services/core/logger/logger.service";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { CredentialsService } from "./../../authentication/credentials/credentials.service";
import {
  CartProduct,
  Product,
} from "./../../../services/classes/models/product";
import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";

const log = new Logger("Prod-View");

@Component({
  selector: "app-product-view",
  templateUrl: "./product-view.component.html",
  styleUrls: ["./product-view.component.css"],
})
export class ProductViewComponent implements OnInit {
  itemQuantity = 1;
  productDetails: Product = null;
  isLoggedIn = false;
  carts: any[] = [];
  wishlist: CartProduct[] = [];
  wishTotal: number;
  cartTotal: number;
  productId: number;
  wishListProductIds: number[] = [];
  relatedProducts: any[] = [];
  similarProducts = true;
  constructor(
    private credentialsService: CredentialsService,
    private notifyService: NotificationsService,
    private cartService: CartService,
    private productsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getProductId();
    this.getProductDetails();
    this.isLoggedIn = this.credentialsService.isAuthenticated();
  }

  fixQuantity() {
    if (this.itemQuantity <= 0) {
      this.itemQuantity = 1;
    }
  }

  getProductId() {
    this.route.params.subscribe((p: Params) => {
      if (!p.id) {
        return;
      } else {
        this.productId = p.id;
        this.getProductDetailsFromServer(this.productId);
      }
    });
  }

  getProductDetails() {
    this.productDetails = JSON.parse(sessionStorage.getItem("product_details"));
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

  addProductToCart(product: Product) {
    if (product.in_stock === 1 || product.in_stock === true) {
      if (this.credentialsService.isAuthenticated()) {
        const { id, new_price } = product;
        const payload: any = {
          product_id: id,
          price: new_price,
          quantity: this.itemQuantity,
        };
        log.debug("cart payload: ", payload);
        this.sendCartItemToServer(payload);
      } else {
        this.addToCart(product);
      }
    } else {
      this.notifyService.publishMessages(
        "This product is currently out of stock",
        "warning",
        1
      );
    }
  }

  addProductToWishlist(product: any) {
    if (!this.credentialsService.isAuthenticated()) {
      this.notifyService.publishMessages(
        "Log in to add a product to wishlist",
        "warning",
        1
      );
    } else {
      log.debug("to wishlist");
      const { id, new_price } = product;
      const payload: any = {
        product_id: id,
        price: new_price,
        quantity: this.itemQuantity,
      };
      this.sendWishlistItemToServer(payload);
    }
  }

  addToCart(product: any, quantityToAdd?: number) {
    log.debug("product-to-add: ", product);
    if (quantityToAdd) {
      log.debug("with qty");
      this.cartService.addToCart(product, quantityToAdd);
    } else {
      const { id, new_price } = product;
      product["product_id"] = id;
      product["price"] = new_price;
      this.cartService.addToCart(product, this.itemQuantity);
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
            cartItem["product_name"] = this.productDetails.product_name;
            cartItem["brand_name"] = this.productDetails.production_company;
            cartItem["product_image"] = this.productDetails.product_image;
            cartItem[
              "product_description"
            ] = this.productDetails.product_description;
            this.addToCart(cartItem, cartItem.quantity);
            this.notifyService.publishMessages(res.message, "success", 1);
          } else {
            const { id } = this.productDetails;
            this.productDetails["product_id"] = id;
            this.addToCart(this.productDetails);
            this.notifyService.publishMessages(res.message, "success", 1);
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
        wishlistItem["product_name"] = this.productDetails.product_name;
        wishlistItem["brand_name"] = this.productDetails.production_company;
        wishlistItem["image"] = this.productDetails.product_image;
        wishlistItem[
          "product_description"
        ] = this.productDetails.product_description;
        this.addToWishlist(wishlistItem, 1);
        // log.debug("w-item: ", wishlistItem);
        this.notifyService.publishMessages(res.message, "success", 1);
      } else {
        this.notifyService.publishMessages(res.message, "danger", 1);
      }
    });
  }
}
