import { SocialSignup } from "./../../classes/models/social-signup";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { BaseService } from "./../../core/base/base.service";
import { Injectable } from "@angular/core";
import { Login } from "src/services/classes/models/login";
import { Signup } from "src/services/classes/models/signup";
import { VerificationLink } from "src/services/classes/models/verification-link";

const routes = {
  signUp: "auth/signup",
  resendVerificationLink: "auth/email/resend-verification",
  login: "auth/login",
  logout: "auth/logout",
  confirmEmail: "auth/email/verification",
  socialSignup: "auth/social/signup",
  forgotPassword: "auth/recover",
  resetPassword: "auth/reset/password",
  changePassword: "auth/update/password",
};

@Injectable({
  providedIn: "root",
})
export class AuthService extends BaseService<any> {
  constructor(http: HttpClient) {
    super(http);
  }

  login(payload: Login): Observable<any> {
    return this.sendPost(this.baseUrl(routes.login), payload);
  }

  signUp(payload: Signup): Observable<any> {
    return this.sendPost(this.baseUrl(routes.signUp), payload);
  }

  resendVerificationLink(payload: VerificationLink): Observable<any> {
    return this.sendPost(this.baseUrl(routes.resendVerificationLink), payload);
  }

  confirmEmailAddressAfterRegistration(token: string): Observable<any> {
    return this.sendGet(this.baseUrl(`${routes.confirmEmail}/${token}`));
  }

  socialSignUp(payload: SocialSignup): Observable<any> {
    return this.sendPost(this.baseUrl(`${routes.socialSignup}`), payload);
  }

  forgotPassword(payload: VerificationLink): Observable<any> {
    return this.sendPost(this.baseUrl(routes.forgotPassword), payload);
  }

  changePassword(payload: any): Observable<any> {
    return this.sendPost(this.baseUrl(routes.changePassword), payload);
  }

  resetPassword(payload: any): Observable<any> {
    return this.sendPost(this.baseUrl(routes.resetPassword), payload);
  }
}
