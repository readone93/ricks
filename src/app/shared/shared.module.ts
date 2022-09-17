import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoaderComponent } from "./loader/loader.component";
import { AlertComponent } from "./alert/alert.component";
import { ServicesModule } from "src/services/services.module";
import { FooterComponent } from "./footer/footer.component";
import { ProductCardComponent } from "./product-card/product-card.component";
import { VendorCardComponent } from "./vendor-card/vendor-card.component";
import { RelatedProductsComponent } from "./related-products/related-products.component";
import { ProfileSidebarComponent } from "./profile-sidebar/profile-sidebar.component";

@NgModule({
  declarations: [
    AlertComponent,
    LoaderComponent,
    FooterComponent,
    ProductCardComponent,
    VendorCardComponent,
    RelatedProductsComponent,
    ProfileSidebarComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ServicesModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  exports: [
    AlertComponent,
    RelatedProductsComponent,
    LoaderComponent,
    ProductCardComponent,
    VendorCardComponent,
    ProfileSidebarComponent,
    FooterComponent,
  ],
})
export class SharedModule {}
