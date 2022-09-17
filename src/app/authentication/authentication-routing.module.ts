import { CreateNewPasswordComponent } from "./create-new-password/create-new-password.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { EmailVerifiedComponent } from "./email-verified/email-verified.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "email-verified/:token", component: EmailVerifiedComponent },
  { path: "reset-password", component: ResetPasswordComponent },
  { path: "create-new-password/:token", component: CreateNewPasswordComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
