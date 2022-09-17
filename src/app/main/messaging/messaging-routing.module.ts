import { MessageDetailsComponent } from "./message-details/message-details.component";
import { MessagesComponent } from "./messages/messages.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  { path: "", component: MessagesComponent },
  { path: "details/:msgId", component: MessageDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessagingRoutingModule {}
