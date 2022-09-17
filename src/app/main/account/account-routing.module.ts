import { EditAccountComponent } from "./edit-account/edit-account.component";
import { AccountComponent } from "./account/account.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    component: AccountComponent,
  },
  {
    path: "edit",
    component: EditAccountComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
