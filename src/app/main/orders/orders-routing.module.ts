import { OrderDetailsComponent } from "./order-details/order-details.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { OrdersComponent } from "./orders/orders.component";

const routes: Routes = [
  {
    path: "",
    component: OrdersComponent,
  },
  {
    path: "details",
    component: OrderDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdersRoutingModule {}
