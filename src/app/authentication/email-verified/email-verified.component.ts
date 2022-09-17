import { finalize } from "rxjs/operators";
import { VerificationLink } from "src/services/classes/models/verification-link";
import { Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Logger } from "./../../../services/core/logger/logger.service";
import { AuthService } from "./../../../services/data/auth/auth.service";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
const log = new Logger("");

@Component({
  selector: "app-email-verified",
  templateUrl: "./email-verified.component.html",
  styleUrls: ["./email-verified.component.css"],
})
export class EmailVerifiedComponent implements OnInit {
  verificationSuccessful: boolean;
  verificationForm: FormGroup;
  isLoading = false;
  isPageLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notifyService: NotificationsService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initResendVerificationForm();
    this.getTokenFromURLAndConfirmToken();
  }

  initResendVerificationForm() {
    this.verificationForm = this.fb.group({
      email: ["", [Validators.email, Validators.required]],
    });
  }

  getTokenFromURLAndConfirmToken() {
    this.route.params.subscribe((param: Params) => {
      this.confirmToken(param.token);
    });
  }

  confirmToken(token: string) {
    this.isPageLoading = true;
    const verifyToken$ = this.authService.confirmEmailAddressAfterRegistration(
      token
    );
    verifyToken$
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            this.verificationSuccessful = true;
            log.debug("res: ", res);
          } else {
            this.verificationSuccessful = false;
            log.debug("error-case: ", res);
          }
        },
        (error) => {
          log.debug("error: ", error);
        }
      );
  }

  submit() {
    const payload = this.verificationForm.value;
    // log.debug("payload: ", payload);
    this.resendVerification(payload);
  }

  resendVerification(payload: VerificationLink) {
    this.isLoading = true;
    const verify$ = this.authService.resendVerificationLink(payload);
    verify$
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            this.notifyService.publishMessages(res.message, "success", 1);
            this.verificationForm.reset();
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => log.debug("error: ", error)
      );
  }
}
