import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { MatPaginatorModule } from "@angular/material";
import { SharedModule } from "./../shared/shared.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MainRoutingModule } from "./main-routing.module";
import { LandingComponent } from "./landing/landing.component";
import { MainComponent } from "./main/main.component";
import { AllProductsComponent } from "./all-products/all-products.component";
import { VendorsComponent } from "./vendors/vendors.component";
import { VendorProductComponent } from "./vendor-product/vendor-product.component";
import { ProductComponent } from "./product/product.component";

import { CreateAccountComponent } from "./create-account/create-account.component";
import { CartPageComponent } from "./cart-page/cart-page.component";
import { CheckoutPageComponent } from "./checkout-page/checkout-page.component";
import { PaymentCompleteComponent } from "./payment-complete/payment-complete.component";

import { AccountComponent } from "./account/account/account.component";
import { ProductViewComponent } from "./product-view/product-view.component";
import { ShoppingCartComponent } from "./shopping-cart/shopping-cart.component";
import { EditAccountComponent } from "./account/edit-account/edit-account.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { WishlistComponent } from "./wishlist/wishlist.component";
import { Angular4PaystackModule } from "angular4-paystack";
import { environment } from "src/environments/environment";
import { SearchComponent } from "./search/search.component";
import { ProductCategoriesComponent } from "./product-categories/product-categories.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { AboutUsComponent } from './about-us/about-us.component';

@NgModule({
  declarations: [
    LandingComponent,
    MainComponent,
    AllProductsComponent,
    VendorsComponent,
    VendorProductComponent,
    ProductComponent,
    AccountComponent,
    ProductViewComponent,
    ShoppingCartComponent,
    EditAccountComponent,
    CheckoutPageComponent,
    CreateAccountComponent,
    WishlistComponent,
    CartPageComponent,
    PaymentCompleteComponent,
    SearchComponent,
    ProductCategoriesComponent,
    ChangePasswordComponent,
    AboutUsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxSliderModule,
    FormsModule,
    MainRoutingModule,
    MatPaginatorModule,
    Angular4PaystackModule.forRoot(environment.publicKey),
    SharedModule,
  ],
})
export class MainModule {}
