import { CredentialsService } from "./../../authentication/credentials/credentials.service";
import { CartService } from "src/services/classes/cart/cart.service";
import { NotificationsService } from "src/services/classes/notifications/notifications.service";
import { Logger } from "./../../../services/core/logger/logger.service";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PageEvent } from "@angular/material";
import { HomeService } from "src/services/data/home/home.service";
import {
  FilterObject,
  ProductsService,
} from "src/services/data/products/products.service";
import { Product, CartProduct } from "src/services/classes/models/product";
import { Options, LabelType } from "@angular-slider/ngx-slider";
import { finalize } from "rxjs/operators";
import { VendorService } from "src/services/data/vendor/vendor.service";

const log = new Logger("Product Category");

@Component({
  selector: "app-product-categories",
  templateUrl: "./product-categories.component.html",
  styleUrls: ["./product-categories.component.css"],
})
export class ProductCategoriesComponent implements OnInit {
  products: any[] = [];
  final = 6;
  showMore = false;
  totalCount = 0;
  item_quantity = 0;
  brands: any[] = [];
  cat_name: string;
  sub_cat_name: string;
  child_cat_name: string;
  pageTitle: string;
  childCategoryDetails: any = [];
  categoryDetails: any = [];
  subCategoryDetails: any = [];
  subCategoriesOrChildren: any[] = [];
  id: string;
  brand: any = [];
  brandName: any;
  itemQuantity = 1;
  wishListProductIds: any[] = [];
  carts: any[] = [];
  wishlist: any[] = [];
  wishTotal: number;
  cartTotal: number;
  credentials: any;
  color: any;

  isPageLoading = false;
  selectedSubCategories: any[] = [];
  subCatAvailable = false;
  categories: any[] = [];

  allVendors: any[] = [];
  minimumValueSelected: any;
  maximumValueSelected: any;
  payloadForFilter: FilterObject = {};
  sub_categories: any[] = [];
  filterActive = false;

  categoryId: any;
  childCategoryId: any;

  productsByCategoryId = false;
  productsBySubCategoryId = false;
  productsByChildCategoryId = false;

  isLoggedIn: boolean;
  children = false;
  subCategories = false;
  subCategoryId: any;

  selectedProduct = null;

  featuredProducts: Product[];
  topSellingProducts: Product[] = [];

  pageSizeOptions: number[] = [5, 10, 20, 30, 50, 100];
  pageEvent: PageEvent = {
    length: 0,
    pageIndex: 1,
    pageSize: 10,
  };

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private notifyService: NotificationsService,
    private router: Router,
    private homeService: HomeService,
    private credentialsService: CredentialsService,
    private cartService: CartService,
    private vendorsService: VendorService
  ) {}

  ngOnInit() {
    this.getPageOrientation();
    this.isLoggedIn = this.credentialsService.isAuthenticated();
    this.credentials = this.credentialsService.credentials;
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

  getPageOrientation() {
    this.route.url.subscribe((res: any) => {
      log.debug("url: ", res);

      switch (res[0].path) {
        case "category":
          this.categoryId = res[1].path;
          this.getProductsByCategoryId(this.categoryId);
          this.subCategories = true;
          // this.getCategorySubCategories(this.categoryId);
          log.debug("res cat");
          break;
        case "sub-category":
          this.subCategoryId = res[1].path;
          this.getProductsBySubCategoryId(this.subCategoryId);
          this.children = true;
          // this.getSubCategoryChildren(this.subCategoryId);
          log.debug("res sub");
          break;
        default:
          break;
      }
    });
  }

  // addToCart(product: any) {
  //   const color_array = JSON.parse(product.color);
  //   this.color = color_array[0];
  //   this.cartService.addToCart(product, this.itemQuantity, this.color);
  //   // console.log("cart content: ", JSON.parse(sessionStorage.getItem("cart")));
  // }

  getProductsByCategoryId(
    categoryId: number,
    currentPage: number = 1,
    per_page: number = 12
  ) {
    this.productsByCategoryId = true;
    this.productsByChildCategoryId = false;
    this.productsBySubCategoryId = false;
    this.isPageLoading = true;
    log.debug(
      "prod: ",
      this.productsByCategoryId,
      "child: ",
      this.productsByChildCategoryId,
      "sub: ",
      this.productsBySubCategoryId
    );
    this.categoryDetails = JSON.parse(sessionStorage.getItem("details"));
    this.cat_name =
      this.categoryDetails.cat_name || this.categoryDetails.category.cat_name;
    this.pageTitle = this.cat_name;
    this.productsService
      .getProductsByCategoryId(categoryId, currentPage, per_page)
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe(
        (res) => {
          if (res.data !== null) {
            this.products = res.data.data;
            this.pageEvent.pageSize = res.data.per_page;
            this.pageEvent.pageIndex = res.data.current_page;
            this.pageEvent.length = res.data.total;
            log.debug("data: ", res);
            if (this.products != null) {
              this.totalCount = this.products.length;
              if (this.totalCount < this.final) {
                this.showMore = false;
              }
              this.products.forEach((element) => {
                if (element.product_image.includes("|")) {
                  element.product_image = element.product_image.split("|");
                  element.product_image = element.product_image[0];
                } else {
                  element.product_image = element.product_image;
                }
                element.averageRating = 0;

                if (element.review) {
                  for (let index = 0; index < element.review.length; index++) {
                    element.averageRating =
                      element.averageRating + element.review[index].rating;

                    if (index == element.review.length - 1) {
                      element.averageRating = parseFloat(
                        (element.averageRating / element.review.length).toFixed(
                          1
                        )
                      );
                    }
                  }
                }
              });
            }

            log.debug("products-cat: ", this.products);
          } else {
            this.products = [];
          }
        },
        (error) => {
          log.debug("error: ", error);
        }
      );
  }

  getProductsBySubCategoryId(
    subCategoryId: number,
    currentPage: number = 1,
    per_page: number = 6
  ) {
    this.productsByCategoryId = false;
    this.productsByChildCategoryId = false;
    this.productsBySubCategoryId = true;
    this.isPageLoading = true;
    log.debug(
      "prod: ",
      this.productsByCategoryId,
      "child: ",
      this.productsByChildCategoryId,
      "sub: ",
      this.productsBySubCategoryId
    );
    this.subCategoryDetails = JSON.parse(sessionStorage.getItem("details"));
    this.categoryDetails = this.subCategoryDetails.category;
    this.cat_name = this.subCategoryDetails.category.cat_name;
    this.sub_cat_name =
      this.subCategoryDetails.sub_cat_name ||
      this.subCategoryDetails.subcategory.sub_cat_name;
    this.pageTitle = this.sub_cat_name;
    this.productsService
      .getProductsBySubCategoryId(subCategoryId, currentPage, per_page)
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe((res) => {
        if (res.data !== null) {
          this.products = res.data.data;
          this.pageEvent.pageSize = res.data.per_page;
          this.pageEvent.pageIndex = res.data.current_page;
          this.pageEvent.length = res.data.total;
          log.debug("res-sub: ", res);
          if (this.products != null) {
            this.totalCount = this.products.length;
            if (this.totalCount <= this.final) {
              this.showMore = false;
            }
            this.products.forEach((element) => {
              if (element.product_image !== null) {
                if (element.product_image.includes("|")) {
                  element.product_image = element.product_image.split("|");
                  element.product_image = element.product_image[0];
                } else {
                  element.product_image = element.product_image;
                }
              }

              element.averageRating = 0;

              if (element.review) {
                for (let index = 0; index < element.review.length; index++) {
                  element.averageRating =
                    element.averageRating + element.review[index].rating;

                  if (index == element.review.length - 1) {
                    element.averageRating = parseFloat(
                      (element.averageRating / element.review.length).toFixed(1)
                    );
                  }
                }
              }
            });
          }

          log.debug("products-sub: ", this.products);
        } else {
          this.products = [];
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageEvent = { ...this.pageEvent, ...event };
    let { pageSize, pageIndex } = this.pageEvent;
    pageIndex = pageIndex + 1;
    if (this.productsByCategoryId === true) {
      this.getProductsByCategoryId(this.categoryId, pageIndex, pageSize);
    } else if (this.productsBySubCategoryId === true) {
      this.getProductsBySubCategoryId(this.subCategoryId, pageIndex, pageSize);
    }
    // this.getAllProducts(pageIndex, pageSize);
    window.scrollTo(0, 0);
    log.debug("page event triggered", pageIndex, pageSize);
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

  // Sorting Stuff
  sortProducts(e: any) {
    const valueToSort = e.target.value;
    this.payloadForFilter.sort = valueToSort;
    this.filterProducts(this.payloadForFilter);
  }

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
              this.products = res.data.data;
              window.scrollTo(0, 0);
            } else {
              this.products = [];
              window.scrollTo(0, 0);
            }
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => log.debug("error: ", error)
      );
  }

  reloadPage() {
    location.reload();
  }
}
