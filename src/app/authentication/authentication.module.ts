import { SharedModule } from "./../shared/shared.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AuthenticationRoutingModule } from "./authentication-routing.module";
import { LoginComponent } from "./login/login.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { EmailVerifiedComponent } from "./email-verified/email-verified.component";
import { CreateNewPasswordComponent } from './create-new-password/create-new-password.component';

@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    EmailVerifiedComponent,
    CreateNewPasswordComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthenticationRoutingModule,
    SharedModule,
  ],
})
export class AuthenticationModule {}
