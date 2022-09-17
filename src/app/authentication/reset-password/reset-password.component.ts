import { VerificationLink } from "src/services/classes/models/verification-link";
import { Logger } from "./../../../services/core/logger/logger.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { AuthService } from "./../../../services/data/auth/auth.service";
import { Component, OnInit } from "@angular/core";

const log = new Logger("Forgot-Password");
@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.css"],
})
export class ResetPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;

  constructor(
    private authService: AuthService,
    private notifyService: NotificationsService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.createForgotPasswordForm();
  }

  createForgotPasswordForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ["", Validators.required],
    });
  }

  submit() {
    log.debug("values: ", this.forgotPasswordForm.value);
    const payload = this.forgotPasswordForm.value;
    this.forgotPassword(payload);
  }

  forgotPassword(payload: VerificationLink) {
    const forgot$ = this.authService.forgotPassword(payload);
    forgot$.subscribe(
      (res: any) => {
        if (res.error === false) {
          log.debug("res: ", res.data);
          this.notifyService.publishMessages(res.message, "success", 1);
          this.router.navigateByUrl("/");
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }
}
