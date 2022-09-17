import { Logger } from "./../../core/logger/logger.service";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

const log = new Logger("Cart");

@Injectable({
  providedIn: "root",
})
export class CartService {
  cart: Array<any> = [];
  wishList: Array<any> = [];
  duplicates = 0;
  cartTotal = 0;
  wishTotal = 0;
  cartUpdate: BehaviorSubject<{
    cartUpdate: boolean;
    listUpdate: boolean;
  }> = new BehaviorSubject<{ cartUpdate: boolean; listUpdate: boolean }>({
    cartUpdate: false,
    listUpdate: false,
  });

  addToCart(product_details: any, quantity_ordered: number, color?: string) {
    this.duplicates = 0;
    if (sessionStorage.getItem("cart")) {
      this.cart = JSON.parse(sessionStorage.getItem("cart"));
      // log.debug("cart content", this.cart);
    }

    if (this.cart.length > 0) {
      for (let index = 0; index < this.cart.length; index++) {
        if (color) {
          if (
            (this.cart[index].product_id == product_details.product_id ||
              this.cart[index].product_id == product_details.product_id) &&
            this.cart[index].color == color
          ) {
            this.cart[index].quantity_ordered =
              +this.cart[index].quantity_ordered + quantity_ordered;
            this.duplicates++;
          }
        } else {
          if (this.cart[index].product_id == product_details.product_id) {
            this.cart[index].quantity_ordered =
              +this.cart[index].quantity_ordered + quantity_ordered;
            this.duplicates++;
          }
        }

        if (index == this.cart.length - 1) {
          if (this.duplicates == 0) {
            if (color) {
              this.cart.push({
                id: product_details.id,
                product_id: product_details.product_id,
                product_name: product_details.product_name,
                quantity_ordered: quantity_ordered,
                unit_price: product_details.price,
                image: product_details.product_image,
                item_description: product_details.product_description,
                sku: product_details.sku,
                // color: color,
                description: product_details.product_description,
                size: product_details.dimension,
                brand: product_details.brand_name,
                brand_id: product_details.brand_id,
                cartId: product_details.cartId,
                delivery_location1: product_details.delivery_location1,
                delivery_location2: product_details.delivery_location2,
                shipping_fee:
                  product_details.shipping_fee !== null
                    ? product_details.shipping_fee
                    : 0,
                user_id: product_details.user_id,
                user:
                  "user" in product_details
                    ? product_details.user.company_name
                    : null,
              });
            } else {
              this.cart.push({
                id: product_details.id,
                product_id: product_details.product_id,
                product_name: product_details.product_name,
                quantity_ordered: quantity_ordered,
                unit_price: product_details.price,
                image: product_details.product_image,
                item_description: product_details.product_description,
                sku: product_details.sku,
                // color: JSON.parse(product_details.color)[0],
                // color_array: JSON.parse(product_details.color),
                description: product_details.product_description,
                size: product_details.dimension,
                brand: product_details.brand_name,
                brand_id: product_details.brand_id,
                cartId: product_details.cartId,
                delivery_location1: product_details.delivery_location1,
                delivery_location2: product_details.delivery_location2,
                shipping_fee:
                  product_details.shipping_fee !== null
                    ? product_details.shipping_fee
                    : 0,
                user_id: product_details.user_id,
                user:
                  "user" in product_details
                    ? product_details.user.company_name
                    : null,
              });
            }
            this.cartSubmission();
            return;
          } else {
            this.cartSubmission();
          }
        }
      }
    } else {
      if (color) {
        this.cart.push({
          id: product_details.id,
          product_id: product_details.product_id,
          product_name: product_details.product_name,
          quantity_ordered: quantity_ordered,
          unit_price: product_details.price,
          image: product_details.product_image,
          item_description: product_details.product_description,
          sku: product_details.sku,
          // color: color,
          description: product_details.product_description,
          size: product_details.dimension,
          brand: product_details.brand_name,
          brand_id: product_details.brand_id,
          delivery_location1: product_details.delivery_location1,
          delivery_location2: product_details.delivery_location2,
          cartId: product_details.cartId,
          user_id: product_details.user_id,
          shipping_fee:
            product_details.shipping_fee !== null
              ? product_details.shipping_fee
              : 0,
          user:
            "user" in product_details
              ? product_details.user.company_name
              : null,
        });
      } else {
        this.cart.push({
          id: product_details.id,
          product_id: product_details.product_id,
          product_name: product_details.product_name,
          quantity_ordered: quantity_ordered,
          unit_price: product_details.price,
          image: product_details.product_image,
          item_description: product_details.product_description,
          sku: product_details.sku,
          // color: JSON.parse(product_details.color)[0],
          // color_array: JSON.parse(product_details.color),
          description: product_details.product_description,
          size: product_details.dimension,
          brand: product_details.brand_name,
          brand_id: product_details.brand_id,
          cartId: product_details.cartId,
          delivery_location1: product_details.delivery_location1,
          delivery_location2: product_details.delivery_location2,
          user_id: product_details.user_id,
          shipping_fee:
            product_details.shipping_fee !== null
              ? product_details.shipping_fee
              : 0,
          user:
            "user" in product_details
              ? product_details.user.company_name
              : null,
        });
      }
      this.cartSubmission();
    }
  }

  removeFromCart(index) {
    this.cart = JSON.parse(sessionStorage.getItem("cart"));
    this.cart.splice(index, 1);
    this.cartSubmission();
  }

  removeFromList(index) {
    this.wishList = JSON.parse(sessionStorage.getItem("wishList"));
    // index = index - 1;
    this.wishList.splice(index, 1);
    this.updateWishList();
  }

  reduceQuantity(product_details, quantity_ordered, color?) {
    for (let index = 0; index < this.cart.length; index++) {
      if (color) {
        if (
          this.cart[index].id == product_details.id &&
          this.cart[index].color == color
        ) {
          this.cart[index].quantity_ordered =
            +this.cart[index].quantity_ordered - quantity_ordered;
        }
      } else {
        if (this.cart[index].id == product_details.id) {
          this.cart[index].quantity_ordered =
            +this.cart[index].quantity_ordered - quantity_ordered;
        }
      }

      if (index == this.cart.length - 1) {
        this.cartSubmission();
      }
    }
  }

  cartSubmission() {
    this.cartTotal = 0;
    this.cart.forEach((element) => {
      this.cartTotal =
        this.cartTotal + +element.unit_price * +element.quantity_ordered;
    });

    sessionStorage.setItem("cart", JSON.stringify(this.cart));
    sessionStorage.setItem("cartTotal", JSON.stringify(this.cartTotal));
    this.cartUpdate.next({ cartUpdate: true, listUpdate: false });
    setTimeout(() => {
      this.cartUpdate.next({ cartUpdate: false, listUpdate: false });
    }, 1000);
  }

  setQuantity(product_details, color) {
    for (let index = 0; index < this.cart.length; index++) {
      if (color) {
        if (
          this.cart[index].id == product_details.id &&
          this.cart[index].color == color
        ) {
          this.cart[index].quantity_ordered = product_details.quantity_ordered;
        }
      } else {
        if (this.cart[index].id == product_details.id) {
          this.cart[index].quantity_ordered = product_details.quantity_ordered;
        }
      }

      if (index == this.cart.length - 1) {
        this.cartSubmission();
      }
    }
  }

  updateProductShippingFee(newShippingFee: any, product_details: any) {
    if (this.cart.length > 1) {
      log.debug("more than 1 item: ", product_details, newShippingFee);
      for (let index = 0; index < this.cart.length; index++) {
        if (this.cart[index].id == product_details.id) {
          log.debug("same ID", this.cart[index].id);
          this.cart[index].shipping_fee = newShippingFee;
        }
        if (index == this.cart.length - 1) {
          this.cartSubmission();
        }
      }
    } else {
      log.debug("1 item in cart: ", this.cart);
      this.cart[0].shipping_fee = newShippingFee;
      this.cartUpdate.next({ cartUpdate: true, listUpdate: false });
      setTimeout(() => {
        this.cartUpdate.next({ cartUpdate: false, listUpdate: false });
      }, 1000);
    }
  }

  clearCart() {
    this.cart = [];
    this.cartTotal = 0;
    sessionStorage.setItem("cart", JSON.stringify(this.cart));
    sessionStorage.setItem("cartTotal", JSON.stringify(this.cartTotal));
    this.cartUpdate.next({ cartUpdate: true, listUpdate: false });
    setTimeout(() => {
      this.cartUpdate.next({ cartUpdate: false, listUpdate: false });
    }, 1000);
  }

  clearWishlist() {
    this.wishList = [];
    this.wishTotal = 0;
    sessionStorage.setItem("wishList", JSON.stringify(this.wishList));
    sessionStorage.setItem("wishTotal", JSON.stringify(this.wishTotal));
    this.cartUpdate.next({ cartUpdate: true, listUpdate: false });
    setTimeout(() => {
      this.cartUpdate.next({ cartUpdate: false, listUpdate: false });
    }, 1000);
  }

  clearCartAfterPurchase() {
    this.cart = [];
    this.cartTotal = 0;
    sessionStorage.setItem("cart", JSON.stringify(this.cart));
    sessionStorage.setItem("cartTotal", JSON.stringify(this.cartTotal));
    this.cartUpdate.next({ cartUpdate: true, listUpdate: false });
    setTimeout(() => {
      this.cartUpdate.next({ cartUpdate: false, listUpdate: false });
    }, 1000);
  }

  /* WishList */

  addToWishList(product_details, quantity_ordered) {
    this.duplicates = 0;
    if (sessionStorage.getItem("wishList")) {
      this.wishList = JSON.parse(sessionStorage.getItem("wishList"));
    }

    if (this.wishList.length > 0) {
      for (let index = 0; index < this.wishList.length; index++) {
        if (this.wishList[index].product_id == product_details.id) {
          this.wishList[index].quantity_ordered =
            +this.wishList[index].quantity_ordered + quantity_ordered;
          this.duplicates++;
        }

        if (index == this.wishList.length - 1) {
          if (this.duplicates == 0) {
            this.wishList.push({
              product_id: product_details.product_id,
              product_name: product_details.product_name,
              quantity_ordered: quantity_ordered,
              unit_price: product_details.new_price,
              image: product_details.image,
              item_description: product_details.product_description,
              sku: product_details.sku,
              // color_array: JSON.parse(product_details.color),
              description: product_details.product_description,
              size: product_details.dimension,
              brand: product_details.brand_name,
              brand_id: product_details.brand_id,
              wishlistId: product_details.wishlistId,
            });
          }
          this.updateWishList();
          return;
        } else {
          this.updateWishList();
        }
      }
    } else {
      this.wishList.push({
        product_id: product_details.product_id,
        product_name: product_details.product_name,
        quantity_ordered: quantity_ordered,
        unit_price: product_details.new_price,
        image: product_details.image,
        item_description: product_details.product_description,
        sku: product_details.sku,
        // color_array: JSON.parse(product_details.color),
        description: product_details.product_description,
        size: product_details.dimension,
        brand: product_details.brand_name,
        brand_id: product_details.brand_id,
        wishlistId: product_details.wishlistId,
      });
    }
    this.updateWishList();
  }

  updateWishList() {
    this.wishTotal = 0;
    this.wishList.forEach((element) => {
      this.wishTotal = this.wishTotal + parseInt(element.unit_price, 10);
    });
    sessionStorage.setItem("wishList", JSON.stringify(this.wishList));
    sessionStorage.setItem("wishTotal", JSON.stringify(this.wishTotal));
    this.cartUpdate.next({ cartUpdate: false, listUpdate: true });
    setTimeout(() => {
      this.cartUpdate.next({ cartUpdate: false, listUpdate: false });
    }, 1000);
  }

  emptyCart() {
    sessionStorage.removeItem("cartTotal");
    sessionStorage.removeItem("cart");
  }
}
