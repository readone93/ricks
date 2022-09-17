import { ReactiveFormsModule } from "@angular/forms";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "./../../shared/shared.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { OrdersRoutingModule } from "./orders-routing.module";
import { OrdersComponent } from "./orders/orders.component";
import { OrderDetailsComponent } from "./order-details/order-details.component";
import { MatPaginatorModule } from "@angular/material";

@NgModule({
  declarations: [OrdersComponent, OrderDetailsComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    OrdersRoutingModule,
    MatPaginatorModule,
  ],
})
export class OrdersModule {}
