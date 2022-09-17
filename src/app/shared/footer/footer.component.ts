import { finalize } from "rxjs/operators";
import { ProfileService } from "./../../../services/data/profile/profile.service";
import { ContactForm } from "./../../../services/classes/models/contact-form";
import { Logger } from "./../../../services/core/logger/logger.service";
import { Validators } from "@angular/forms";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { FormBuilder } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, OnInit } from "@angular/core";

const log = new Logger("Footer");
@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent implements OnInit {
  year: any;
  contactForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private notifyService: NotificationsService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.year = new Date().getFullYear();
    this.initForm();
  }

  /**
   * {
    "email": "josh@gmail",
    "fullname": "josh gbayi",
    "phoneno": "0812222111",
    "message": "qwer we xsds"
}
   */
  initForm() {
    this.contactForm = this.fb.group({
      email: ["", Validators.required],
      fullname: ["", Validators.required],
      phoneno: ["", Validators.required],
      message: ["", Validators.required],
    });
  }

  submitContactForm() {
    log.debug("contact: ", this.contactForm.value);
    const payload = this.contactForm.value;
    this.contactAdmin(payload);
  }

  contactAdmin(payload: ContactForm) {
    this.isLoading = true;
    const contact$ = this.profileService.contactAdmin(payload);

    contact$
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            this.notifyService.publishMessages(res.message, "success", 1);
            document.getElementById("contactFormModalCloseBtn").click();
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => {
          log.debug("error: ", error);
        }
      );
  }
}
