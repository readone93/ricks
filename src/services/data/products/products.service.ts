import { CartProduct } from "src/services/classes/models/product";
import { Product } from "./../../classes/models/product";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { BaseService } from "./../../core/base/base.service";
import { Injectable } from "@angular/core";
import { RecommendedProduct } from "src/services/classes/models/recommended-product";

export interface FilterObject {
  cat_id?: number;
  sub_cat_id?: number;
  startprice?: number;
  endprice?: number;
  merchant_id?: number;
  sort?: string;
}

const routes = {
  cart: "users/carts",
  products: "guest/products",
  wishlist: "users/wishlist",
  search: "guest/products/search",
  categoriesWithSubCategories: "guest/categories",
  productsUnderCategories: "guest/categories/other",
  productsByCategoryId: "guest/categories",
  productsBySubCategoryId: "guest/subcategory",
  recommendedProducts: "guest/products/recommendation",
  filterProducts: "guest/products/filter",
};

@Injectable({
  providedIn: "root",
})
export class ProductsService extends BaseService<any> {
  constructor(http: HttpClient) {
    super(http);
  }

  /* Cart Endpoints */

  addToCart(payload: CartProduct): Observable<any> {
    return this.sendPost(this.baseUrl(routes.cart), payload);
  }

  // Increase or reduce product count in cart
  updateCart(cartId: number, payload: CartProduct): Observable<any> {
    return this.sendPut(this.baseUrl(`${routes.cart}/${cartId}`), payload);
  }

  /**
   * Add to cart after login
   * @param payload { carts: [products] }
   */
  transferToCart(payload: any): Observable<any> {
    return this.sendPost(this.baseUrl(`${routes.cart}/transfer`), payload);
  }

  deleteCartItem(cartId: number): Observable<any> {
    return this.sendDelete(this.baseUrl(`${routes.cart}/${cartId}`));
  }

  getCartItems(): Observable<any> {
    return this.sendGet(this.baseUrl(routes.cart));
  }
  /* End Cart Endpoints */

  getProducts(): Observable<any> {
    return this.sendGet(this.baseUrl(routes.products));
  }

  /* Wishlist Routes */
  getWishlistItems(): Observable<any> {
    return this.sendGet(this.baseUrl(routes.wishlist));
  }

  addToWishlist(payload: CartProduct): Observable<any> {
    return this.sendPost(this.baseUrl(routes.wishlist), payload);
  }

  deleteFromWishlist(wishlistId: number): Observable<any> {
    return this.sendDelete(this.baseUrl(`${routes.wishlist}/${wishlistId}`));
  }
  /* End Wishlist Routes */

  /* Search */
  searchProducts(searchQuery: string, current_page = 1): Observable<any> {
    return this.sendGet(
      this.baseUrl(
        `${routes.search}?search=${searchQuery}&page=${current_page}`
      )
    );
  }

  getCategoriesWithSubcats(): Observable<any> {
    return this.sendGet(this.baseUrl(routes.categoriesWithSubCategories));
  }

  getProductsWithCategories(): Observable<any> {
    return this.sendGet(this.baseUrl(routes.productsUnderCategories));
  }

  getProductsByCategoryId(
    catId: number,
    currentPage: number,
    pageSize: number
  ): Observable<any> {
    return this.sendGet(
      this.baseUrl(
        `${routes.productsByCategoryId}/${catId}?page=${currentPage}`
      )
    );
  }

  getProductsBySubCategoryId(
    subCatId: number,
    currentPage: number,
    pageSize: number
  ): Observable<any> {
    return this.sendGet(
      this.baseUrl(
        `${routes.productsBySubCategoryId}/${subCatId}?page=${currentPage}`
      )
    );
  }

  getProductDetails(productId: number): Observable<any> {
    return this.sendGet(this.baseUrl(`${routes.products}/${productId}`));
  }

  getRecommendedProducts(payload: RecommendedProduct): Observable<any> {
    return this.sendPost(this.baseUrl(routes.recommendedProducts), payload);
  }

  /**
   * Allowed values
   * cat_id=1
   * startprice=1000
   * endprice=2000
   * merchant_id=3
   * sort="sortType"
   *
   * example request
   * Note that all values are of type number
   * /api/v1/guest/products/filter?cat_id=1&startprice=1000&endprice=2000&merchant_id=3
   */

  filterProducts(payload: FilterObject): Observable<any> {
    return this.sendPost(this.baseUrl(`${routes.filterProducts}`), payload);
  }
}
