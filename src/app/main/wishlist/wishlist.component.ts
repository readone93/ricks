import { Router } from "@angular/router";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { ProductsService } from "./../../../services/data/products/products.service";
import { Logger } from "./../../../services/core/logger/logger.service";
import {
  CartProduct,
  Product,
} from "./../../../services/classes/models/product";
import { CartService } from "./../../../services/classes/cart/cart.service";
import { Component, OnInit } from "@angular/core";
import { RecommendedProduct } from "src/services/classes/models/recommended-product";

const log = new Logger("Wishlist");
@Component({
  selector: "app-wishlist",
  templateUrl: "./wishlist.component.html",
  styleUrls: ["./wishlist.component.css"],
})
export class WishlistComponent implements OnInit {
  carts: any[] = [];
  wishlist: any[] = [];
  wishTotal: number;
  cartTotal: string;
  totalShippingFee: any;
  isLoggedIn = false;
  isLoading = false;
  selectedProduct: Product = null;
  selectedProductIndex: number;
  deliveryFee = 15;
  itemQuantity = 1;
  relatedProducts: any[] = [];
  selectedCartProduct = null;
  similarProducts = false;
  constructor(
    private cartService: CartService,
    private productsService: ProductsService,
    private router: Router,
    private notifyService: NotificationsService
  ) {}

  ngOnInit() {
    this.getCart();
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

  assignAsSelectedProduct(product: any, productIndex: number) {
    this.selectedProduct = product;
    this.selectedProductIndex = productIndex;
  }

  assignAsSelectedCartProduct(product: any) {
    this.selectedCartProduct = product;
    const { product_id, unit_price } = this.selectedCartProduct;
    const payload: any = {
      product_id: product_id,
      price: unit_price,
      quantity: this.itemQuantity,
    };
    log.debug("cart payload: ", payload);
    this.sendCartItemToServer(payload);
    document.getElementById("cartModalTrigger").click();
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
            cartItem["quantity_ordered"] = cartItem.quantity;
            cartItem["product_name"] = this.selectedCartProduct.product_name;
            cartItem["brand_name"] = this.selectedCartProduct.brand;
            cartItem["product_image"] = this.selectedCartProduct.image;
            cartItem[
              "product_description"
            ] = this.selectedCartProduct.description;
            this.addToCart(cartItem, cartItem.quantity_ordered);
            this.notifyService.publishMessages(res.message, "success", 1);
          } else {
            this.addToCart(this.selectedCartProduct);
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

  addToCart(product: any, quantityToAdd?: number) {
    log.debug("product-to-add: ", product);
    if (quantityToAdd) {
      log.debug("with qty");
      this.cartService.addToCart(product, quantityToAdd);
    } else {
      const { unit_price } = this.selectedCartProduct;
      this.selectedProduct["price"] = unit_price;
      this.cartService.addToCart(this.selectedProduct, this.itemQuantity);
    }
    this.getCart();
  }

  removeFromWishlist(product: any, productIndex: number) {
    const removeWishlistItem$ = this.productsService.deleteFromWishlist(
      product.wishlistId
    );
    removeWishlistItem$.subscribe((res: any) => {
      if (res.error === false) {
        log.debug("w-res: ", res);
        this.cartService.removeFromList(productIndex);
        this.notifyService.publishMessages(res.message, "success", 1);
        document.getElementById("wishlistModalCloseBtn").click();
        this.getCart();
      } else {
        this.notifyService.publishMessages(res.message, "danger", 1);
      }
    });
  }

  fixQuantity() {
    if (this.itemQuantity <= 0) {
      this.itemQuantity = 1;
    }
  }

  restoreCartItemQuantity() {
    const cartItemCounter: any = document.getElementById("cartItemQuantity");
    cartItemCounter.value = 1;
  }

  goToCart() {
    document.getElementById("cartModalCloseBtn").click();
    this.router.navigateByUrl("/cart");
  }

  goHome() {
    document.getElementById("cartModalCloseBtn").click();
    this.router.navigateByUrl("/");
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
