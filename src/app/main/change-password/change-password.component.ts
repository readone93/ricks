import { finalize } from "rxjs/operators";
import { Router } from "@angular/router";
import { AuthService } from "./../../../services/data/auth/auth.service";
import { Logger } from "./../../../services/core/logger/logger.service";
import { FormGroup, Validators } from "@angular/forms";
import { ProfileService } from "./../../../services/data/profile/profile.service";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { FormBuilder } from "@angular/forms";
import { Component, OnInit } from "@angular/core";

const log = new Logger("Change Password");

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.css"],
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  isPageLoading: boolean;
  oldPasswordType: boolean;
  newPasswordType: boolean;
  showText: boolean;
  newShowText: boolean;

  constructor(
    private fb: FormBuilder,
    private notifyService: NotificationsService,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initChangePasswordForm();
  }

  showOldPasswordText() {
    this.oldPasswordType = !this.oldPasswordType;
    this.showText = !this.showText;
  }

  showNewPasswordText() {
    this.newPasswordType = !this.newPasswordType;
    this.newShowText = !this.newShowText;
  }

  initChangePasswordForm() {
    this.changePasswordForm = this.fb.group({
      password: ["", Validators.required],
      old_password: ["", Validators.required],
    });
  }

  submit() {
    log.debug("form-values: ", this.changePasswordForm.value);
    const payload = this.changePasswordForm.value;
    this.changePassword(payload);
  }

  changePassword(payload: any) {
    this.isPageLoading = true;
    const update$ = this.authService.changePassword(payload);
    update$
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("res: ", res);
            this.notifyService.publishMessages(res.message, "success", 1);
            this.router.navigate(["/", "account"]);
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => log.debug("error: ", error)
      );
  }
}
