import { SharedModule } from "./../../shared/shared.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AccountRoutingModule } from "./account-routing.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, AccountRoutingModule, SharedModule],
})
export class AccountModule {}
