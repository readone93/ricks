import { Params } from "@angular/router";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Logger } from "./../../../services/core/logger/logger.service";
import { Validators } from "@angular/forms";
import { AuthService } from "./../../../services/data/auth/auth.service";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { FormBuilder } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { MustMatch } from "src/services/core/helper/helper";

const log = new Logger("Create-New-Password");
@Component({
  selector: "app-create-new-password",
  templateUrl: "./create-new-password.component.html",
  styleUrls: ["./create-new-password.component.css"],
})
export class CreateNewPasswordComponent implements OnInit {
  createNewPassword: FormGroup;
  userEmail: string;
  userToken: string;
  constructor(
    private fb: FormBuilder,
    private notifyService: NotificationsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initNewPasswordForm();
    this.getEmailFromUrl();
    this.getTokenFromUrl();
  }

  getEmailFromUrl() {
    this.route.queryParamMap.subscribe((params: Params) => {
      const url = { ...params.keys, ...params };
      for (let value in url) {
        if (url[value]["email"]) {
          this.userEmail = url[value]["email"];
          log.debug("email: ", this.userEmail);
          this.createNewPassword.patchValue({
            email: this.userEmail,
          });
        } else {
          this.userEmail = "";
        }
      }
    });
  }

  getTokenFromUrl() {
    this.route.params.subscribe((p: Params) => {
      if (p["token"]) {
        this.userToken = p["token"];
        log.debug("token: ", this.userToken);
      } else {
        this.userToken = "";
      }
    });
  }

  initNewPasswordForm() {
    this.createNewPassword = this.fb.group(
      {
        email: [{ value: "", disabled: true }],
        password: ["", Validators.required],
        password_confirmation: ["", Validators.required],
      },
      {
        validator: MustMatch("password", "password_confirmation"),
      }
    );
  }

  submit() {
    const { password, password_confirmation } = this.createNewPassword.value;
    const payload = {
      token: this.userToken,
      email: this.userEmail,
      password,
      password_confirmation,
    };

    log.debug("payload: ", payload);
    this.resetPassword(payload);
  }

  resetPassword(payload: any) {
    const passwordChanges$ = this.authService.resetPassword(payload);
    passwordChanges$.subscribe(
      (res: any) => {
        if (res.error === false) {
          this.notifyService.publishMessages(res.message, "success", 1);
          log.debug("reset: ", res);
          this.router.navigate(["/"]);
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }
}
