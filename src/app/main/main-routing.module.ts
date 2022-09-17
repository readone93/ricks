import { AboutUsComponent } from "./about-us/about-us.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { ProductCategoriesComponent } from "./product-categories/product-categories.component";
import { SearchComponent } from "./search/search.component";
import { CheckoutPageComponent } from "./checkout-page/checkout-page.component";
import { PaymentCompleteComponent } from "./payment-complete/payment-complete.component";
import { CartPageComponent } from "./cart-page/cart-page.component";
import { AuthGuard } from "./../authentication/auth-guard/auth.guard";
import { WishlistComponent } from "./wishlist/wishlist.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AllProductsComponent } from "./all-products/all-products.component";
import { LandingComponent } from "./landing/landing.component";
import { MainComponent } from "./main/main.component";
import { ProductViewComponent } from "./product-view/product-view.component";
import { ProductComponent } from "./product/product.component";
import { VendorProductComponent } from "./vendor-product/vendor-product.component";
import { VendorsComponent } from "./vendors/vendors.component";

const routes: Routes = [
  {
    path: "",
    component: MainComponent,
    children: [
      { path: "", component: LandingComponent },
      { path: "all-products", component: AllProductsComponent },
      { path: "product", component: ProductComponent },
      { path: "product/:id", component: ProductViewComponent },
      {
        path: "wishlist",
        component: WishlistComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "cart",
        component: CartPageComponent,
      },
      {
        path: "vendors",
        component: VendorsComponent,
      },
      {
        path: "vendor-products/:vendorId",
        component: VendorProductComponent,
      },
      {
        path: "check-out",
        component: CheckoutPageComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "order-success",
        component: PaymentCompleteComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "search",
        component: SearchComponent,
      },
      {
        path: "category/:category",
        component: ProductCategoriesComponent,
      },
      {
        path: "sub-category/:category",
        component: ProductCategoriesComponent,
      },
      {
        path: "change-password",
        component: ChangePasswordComponent,
      },
      {
        path: "about-us",
        component: AboutUsComponent,
      },
      {
        path: "orders",
        loadChildren: () =>
          import("../../app/main/orders/orders.module").then(
            (m) => m.OrdersModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: "account",
        loadChildren: () =>
          import("../main/account/account.module").then((m) => m.AccountModule),
        canActivate: [AuthGuard],
      },
      {
        path: "messages",
        loadChildren: () =>
          import("../main/messaging/messaging.module").then(
            (m) => m.MessagingModule
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
