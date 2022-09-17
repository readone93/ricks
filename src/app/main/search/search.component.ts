import { Logger } from "./../../../services/core/logger/logger.service";
import { ProductsService } from "./../../../services/data/products/products.service";
import { NotificationsService } from "src/services/classes/notifications/notifications.service";
import { LoaderService } from "./../../../services/classes/loader/loader.service";
import { Component, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material";
import { CartProduct, Product } from "src/services/classes/models/product";
import { Router } from "@angular/router";
import { CredentialsService } from "src/app/authentication/credentials/credentials.service";
import { CartService } from "src/services/classes/cart/cart.service";

const log = new Logger("Search");
@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.css"],
})
export class SearchComponent implements OnInit {
  searchResults: any[];
  searchParam: string;

  isLoading = false;
  pageSizeOptions: number[] = [5, 10, 20, 30, 50, 100];

  pageEvent: PageEvent = {
    length: 0,
    pageIndex: 1,
    pageSize: 10,
  };
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
  isLoggedIn: boolean;
  constructor(
    private notifyService: NotificationsService,
    private productsService: ProductsService,
    private router: Router,
    private loaderService: LoaderService,
    private cartService: CartService,
    private credentialsService: CredentialsService
  ) {}

  ngOnInit() {
    this.getSearchParamAndLoadResults();
  }

  getSearchParamAndLoadResults(currentPage: number = 1, per_page: number = 10) {
    this.isLoading = true;
    this.searchParam = sessionStorage.getItem("searchParam");
    if (this.searchParam !== "") {
      const searchResults$ = this.productsService.searchProducts(
        this.searchParam,
        currentPage
      );
      searchResults$.subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("results: ", res);
            if (res.data !== null) {
              this.pageEvent.pageSize = res.data.per_page;
              this.pageEvent.pageIndex = res.data.current_page;
              this.pageEvent.length = res.data.total;
              this.searchResults = res.data.data;
              sessionStorage.setItem(
                "searchResult",
                JSON.stringify(this.searchResults)
              );
              this.isLoading = false;
              this.loaderService.hide();
            } else {
              this.searchResults = [];
              this.isLoading = false;
              this.loaderService.hide();
            }
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
            this.isLoading = false;
            this.searchResults = [];
          }
        },
        (error) => {
          log.debug("error: ", error);
          this.isLoading = false;
        }
      );
    }
  }

  onPageChange(event: PageEvent) {
    this.loaderService.show();
    this.pageEvent = { ...this.pageEvent, ...event };
    let { pageSize, pageIndex } = this.pageEvent;
    pageIndex = pageIndex + 1;
    this.getSearchParamAndLoadResults(pageIndex, pageSize);
    this.loaderService.hide();
    window.scrollTo(0, 0);
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
}
