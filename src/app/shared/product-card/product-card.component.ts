import { NotificationsService } from "src/services/classes/notifications/notifications.service";
import { CredentialsService } from "src/app/authentication/credentials/credentials.service";
import { CartService } from "./../../../services/classes/cart/cart.service";
import { Router } from "@angular/router";
import { Logger } from "src/services/core/logger/logger.service";
import {
  Product,
  CartProduct,
} from "./../../../services/classes/models/product";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Credentials } from "src/app/authentication/credentials/credentials.service";

const log = new Logger("P. Card");
@Component({
  selector: "app-product-card",
  templateUrl: "./product-card.component.html",
  styleUrls: ["./product-card.component.css"],
})
export class ProductCardComponent implements OnInit {
  @Input() product: Product;
  @Output() sendProductDataToParent = new EventEmitter<Product>();
  @Output() sendProductDataToParentForWishlist = new EventEmitter<Product>();
  @Output() sendProductToViewDetails = new EventEmitter<Product>();
  credentials: Credentials = null;
  carts: CartProduct[] = [];
  wishlist: CartProduct[] = [];
  wishTotal: number;
  cartTotal: number;
  wishListProductIds: number[] = [];
  isLoggedIn: boolean;
  color: string;
  allProducts: Product[];
  selectedProduct = null;
  itemQuantity = 1;

  constructor(
    private router: Router,
    private cartService: CartService,
    private notifyService: NotificationsService,
    private credentialsService: CredentialsService
  ) {}

  ngOnInit() {
    this.credentials = this.credentialsService.credentials;
    this.isLoggedIn = this.credentialsService.isAuthenticated();
    this.getProductsInWishlist();
  }

  sendProductToCart(product: Product) {
    this.sendProductDataToParent.emit(product);
  }

  sendProductToCartForWishlist(product: Product) {
    this.sendProductDataToParentForWishlist.emit(product);
  }

  sendProductForViewDetails(product: Product) {
    this.sendProductToViewDetails.emit(product);
  }

  fixRatings(rating: string) {
    const value = parseInt(rating, 10);
    return Math.round(value);
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
}
