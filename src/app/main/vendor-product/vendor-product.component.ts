import { finalize } from "rxjs/operators";
import { FilterObject } from "./../../../services/data/products/products.service";
import { LoaderService } from "./../../../services/classes/loader/loader.service";
import { Logger } from "./../../../services/core/logger/logger.service";
import { Params } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { VendorService } from "./../../../services/data/vendor/vendor.service";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { Component, OnInit, ChangeDetectorRef, NgZone } from "@angular/core";
import { PageEvent } from "@angular/material";
import { CredentialsService } from "src/app/authentication/credentials/credentials.service";
import { CartService } from "src/services/classes/cart/cart.service";
import { Product, CartProduct } from "src/services/classes/models/product";
import { ProductsService } from "src/services/data/products/products.service";
import { Options, LabelType } from "@angular-slider/ngx-slider";

const log = new Logger("Vendor-Prods");
@Component({
  selector: "app-vendor-product",
  templateUrl: "./vendor-product.component.html",
  styleUrls: ["./vendor-product.component.css"],
})
export class VendorProductComponent implements OnInit {
  pageEvent: PageEvent = {
    length: 0,
    pageIndex: 1,
    pageSize: 5,
  };
  isPageLoading = false;
  selectedSubCategories: any[] = [];
  subCatAvailable = false;
  categories: any[] = [];
  pageSizeOptions = [5, 10, 20];
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
  allVendors: any[] = [];
  minimumValueSelected: any;
  maximumValueSelected: any;
  payloadForFilter: FilterObject = {};
  subCategories: any[] = [];
  filterActive = false;
  constructor(
    private notifyService: NotificationsService,
    private vendorsService: VendorService,
    private router: Router,
    private loaderService: LoaderService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private credentialsService: CredentialsService,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    this.getVendorIdAndLoadProducts();
    this.isLoggedIn = this.credentialsService.isAuthenticated();
    this.subCategories = JSON.parse(localStorage.getItem("subCat"));
    log.debug("subCats: ", this.subCategories);
    this.getAllCategories();
    this.getAllVendors();
  }

  minValue: number = 50;
  maxValue: number = 5000;
  options: Options = {
    floor: 100,
    ceil: 5000,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          this.minimumValueSelected = value;
          return "₵" + value;
        case LabelType.High:
          this.maximumValueSelected = value;
          return "₵" + value;
        default:
          return "₵" + value;
      }
    },
  };

  getVendorIdAndLoadProducts() {
    this.route.params.subscribe((p: Params) => {
      if (!p.vendorId) {
        return;
      } else {
        this.vendorId = p.vendorId;
        this.getVendorProducts(p.vendorId);
      }
    });
  }

  getVendorProducts(
    vendorId: number,
    current_page: number = 1,
    per_page: number = 6
  ) {
    this.isPageLoading = true;
    const products$ = this.vendorsService.getProductsByVendorId(
      vendorId,
      current_page,
      per_page
    );
    products$.pipe(finalize(() => (this.isPageLoading = false))).subscribe(
      (res: any) => {
        if (res.error === false) {
          this.vendorDetails = JSON.parse(sessionStorage.getItem("vendor"));
          if (res.data !== null) {
            this.pageEvent.pageSize = res.data.per_page;
            this.pageEvent.pageIndex = res.data.current_page;
            this.pageEvent.length = res.data.total;
            this.vendorProducts = res.data.data;
            if (this.vendorProducts) {
              this.vendorProducts.forEach((element: any) => {
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
              });
            }
            log.debug("products: ", res.data);
          } else {
            this.vendorProducts = [];
          }
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }

  onPageChange(event: PageEvent) {
    this.loaderService.show();
    this.pageEvent = { ...this.pageEvent, ...event };
    let { pageSize, pageIndex } = this.pageEvent;
    pageIndex = pageIndex + 1;
    this.getVendorProducts(this.vendorId, pageIndex);
    this.loaderService.hide();
    log.debug("page event triggered", pageIndex, pageSize);
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

  // restoreCartItemQuantity() {
  //   const cartItemCounter: any = document.getElementById("cartItemQuantity");
  //   cartItemCounter.value = 1;
  // }

  // Filter Stuff
  getAllCategories() {
    const categories = JSON.parse(localStorage.getItem("categories"));
    if (categories !== null) {
      this.categories = categories;
      log.debug("from LS: ", this.categories);
    } else {
      const cats$ = this.productsService.getCategoriesWithSubcats();
      cats$.subscribe(
        (res: any) => {
          if (res.error === false) {
            this.categories = res.data;
            log.debug("from API: ", this.categories);
          } else {
            this.categories = [];
          }
        },
        (error) => log.debug("error: ", error)
      );
    }
  }

  getAllVendors() {
    const allVendors = JSON.parse(localStorage.getItem("all-vendors"));
    if (allVendors !== null) {
      this.allVendors = allVendors;
    } else {
      const vendors$ = this.vendorsService.getAllVendors();
      vendors$.subscribe(
        (res: any) => {
          if (res.error === false) {
            if (res.data !== null) {
              this.allVendors = res.data.data;
              localStorage.setItem(
                "all-vendors",
                JSON.stringify(this.allVendors)
              );
            } else {
              this.allVendors = [];
            }
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => log.debug("error: ", error)
      );
    }
  }

  getSubCategories(e: any) {
    if (e) {
      const catId = e.target.value;
      const catIdObj = { cat_id: catId };
      this.payloadForFilter = { ...catIdObj };
      this.filterProducts(this.payloadForFilter);
      const subCats = JSON.parse(localStorage.getItem("subCat"));
      if (subCats !== null) {
        this.selectedSubCategories = subCats.filter(
          (cat: any) => cat.cat_id === Number(catId)
        );

        if (this.selectedSubCategories.length > 0) {
          this.subCatAvailable = true;
        } else {
          this.subCatAvailable = false;
        }
      }
    }
  }

  selectSubCat(e: any) {
    if (e) {
      const subCatId = e.target.value;
      this.payloadForFilter.sub_cat_id = subCatId;
      this.filterProducts(this.payloadForFilter);
    }
  }

  selectVendor(e: any) {
    if (e) {
      this.payloadForFilter.merchant_id = e.target.value;
      this.filterProducts(this.payloadForFilter);
    }
  }

  selectStartAndEndPrice() {
    log.debug(
      "start: ",
      this.minimumValueSelected,
      "end: ",
      this.maximumValueSelected
    );
    this.payloadForFilter.startprice = this.minimumValueSelected;
    this.payloadForFilter.endprice = this.maximumValueSelected;
    this.filterProducts(this.payloadForFilter);
  }

  filterProducts(payload: FilterObject) {
    this.isPageLoading = true;
    this.filterActive = true;
    const filterProducts$ = this.productsService.filterProducts(payload);
    filterProducts$
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("products: ", res);
            if (res.data !== null) {
              this.pageEvent.pageSize = res.data.per_page;
              this.pageEvent.pageIndex = res.data.current_page;
              this.pageEvent.length = res.data.total;
              this.vendorProducts = res.data.data;
              window.scrollTo(0, 0);
            } else {
              this.vendorProducts = [];
              window.scrollTo(0, 0);
            }
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => log.debug("error: ", error)
      );
  }
}
