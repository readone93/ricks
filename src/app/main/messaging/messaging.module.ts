import {
  MatCheckboxModule,
  MatPaginatorModule,
  MatTableModule,
} from "@angular/material";
import { SharedModule } from "./../../shared/shared.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MessagingRoutingModule } from "./messaging-routing.module";
import { MessagesComponent } from "./messages/messages.component";
import { MessageDetailsComponent } from "./message-details/message-details.component";

@NgModule({
  declarations: [MessagesComponent, MessageDetailsComponent],
  imports: [
    CommonModule,
    MessagingRoutingModule,
    SharedModule,
    MatPaginatorModule,
    MatTableModule,
    MatCheckboxModule,
  ],
})
export class MessagingModule {}
