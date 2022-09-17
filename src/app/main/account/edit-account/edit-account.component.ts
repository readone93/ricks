import { ProductsService } from "./../../../../services/data/products/products.service";
import { Router } from "@angular/router";
import { finalize } from "rxjs/operators";
import { Profile } from "./../../../../services/classes/models/profile";
import {
  Credentials,
  CredentialsService,
} from "src/app/authentication/credentials/credentials.service";
import { Validators } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { ProfileService } from "./../../../../services/data/profile/profile.service";
import { NotificationsService } from "./../../../../services/classes/notifications/notifications.service";
import { FormBuilder } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { Logger } from "src/services/core/logger/logger.service";

const log = new Logger("Profile");

@Component({
  selector: "app-edit-account",
  templateUrl: "./edit-account.component.html",
  styleUrls: ["./edit-account.component.css"],
})
export class EditAccountComponent implements OnInit {
  isPageLoading = false;
  editAccountForm: FormGroup;
  credentials: Credentials;
  relatedProducts: any[] = [];
  changePasswordForm: FormGroup;
  profileInfo: any;

  constructor(
    private fb: FormBuilder,
    private notifyService: NotificationsService,
    private router: Router,
    private profileService: ProfileService,
    private productsService: ProductsService,
    private credentialsService: CredentialsService
  ) {}

  ngOnInit() {
    this.initEditAccountForm();
    this.credentials = this.credentialsService.credentials;
    this.getUserProfile();
  }

  initEditAccountForm() {
    this.editAccountForm = this.fb.group({
      billing_address1: ["", [Validators.minLength(10), Validators.required]],
      billing_state1: ["", Validators.required],
      billing_state2: [""],
      billing_city1: ["", Validators.required],
      billing_city2: [""],
      email: [{ value: "", disabled: true }],
      billing_address2: ["", Validators.minLength(10)],
      shipping_state1: ["", Validators.required],
      shipping_state2: [""],
      shipping_city1: ["", Validators.required],
      shipping_city2: [""],
      shipping_address1: ["", [Validators.minLength(10), Validators.required]],
      shipping_address2: ["", Validators.minLength(10)],
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      phoneno: ["", Validators.required],
      image: [""],
    });
  }

  prefillForm(profile: any) {
    const { userbilling, usershipping } = profile;
    if (userbilling !== null && usershipping === null) {
      this.editAccountForm.patchValue({
        billing_address1: profile.userbilling.address1,
        billing_state1: profile.userbilling.state1,
        billing_state2: profile.userbilling.state2,
        billing_city1: profile.userbilling.city1,
        billing_city2: profile.userbilling.city2,
        billing_address2: profile.userbilling.address2,
        email: profile.email,
        firstname: profile.firstname,
        lastname: profile.lastname,
        phoneno: profile.phoneno,
      });
    }
    if (userbilling === null && usershipping !== null) {
      this.editAccountForm.patchValue({
        shipping_state1: profile.usershipping.state1,
        shipping_state2: profile.usershipping.state2,
        shipping_city1: profile.usershipping.city1,
        shipping_city2: profile.usershipping.city2,
        shipping_address1: profile.usershipping.address1,
        shipping_address2: profile.usershipping.address2,
        email: profile.email,
        firstname: profile.firstname,
        lastname: profile.lastname,
        phoneno: profile.phoneno,
      });
    }
    if (userbilling !== null && usershipping !== null) {
      this.editAccountForm.patchValue({
        billing_address1: profile.userbilling.address1,
        billing_state1: profile.userbilling.state1,
        billing_state2: profile.userbilling.state2,
        billing_city1: profile.userbilling.city1,
        billing_city2: profile.userbilling.city2,
        billing_address2: profile.userbilling.address2,
        shipping_state1: profile.usershipping.state1,
        shipping_state2: profile.usershipping.state2,
        shipping_city1: profile.usershipping.city1,
        shipping_city2: profile.usershipping.city2,
        shipping_address1: profile.usershipping.address1,
        shipping_address2: profile.usershipping.address2,
        email: profile.email,
        firstname: profile.firstname,
        lastname: profile.lastname,
        phoneno: profile.phoneno,
      });
    }

    if (userbilling === null && usershipping === null) {
      this.editAccountForm.patchValue({
        email: profile.email,
        firstname: profile.firstname,
        lastname: profile.lastname,
        phoneno: profile.phoneno,
      });
    }
  }

  handleImgUpload(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      log.debug("file: ", file);
      this.editAccountForm.get("image").setValue(file);
      const holder: any = document.getElementById("new_pic");
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          holder.src = reader.result;
        },
        false
      );
      if (file) {
        reader.readAsDataURL(file);
      }
    }
  }

  get controls() {
    return this.editAccountForm.controls;
  }

  assignFormDataValues(form: FormGroup) {
    const formData = new FormData();
    Object.keys(form.controls).forEach((key) => {
      formData.append(key, form.get(key).value);
    });
    return formData;
  }

  submit() {
    log.debug("f-values: ", this.editAccountForm.getRawValue());
    const payload = this.assignFormDataValues(this.editAccountForm);
    log.debug("value: ", payload);
    this.updateProfile(payload);
  }

  updateProfile(payload: FormData) {
    this.isPageLoading = true;
    const update$ = this.profileService.updateProfile(payload);
    update$
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            this.notifyService.publishMessages(
              "Profile updated successfully",
              "success",
              1
            );
            // this.editAccountForm.reset();
            this.router.navigate(["/", "account"]);
            // log.debug("res: ", res.data);
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => log.debug("error: ", error)
      );
  }

  getUserProfile() {
    this.isPageLoading = true;
    const profile$ = this.profileService.getUserProfile();
    profile$
      .pipe(
        finalize(() => {
          this.isPageLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.error === false) {
            log.debug("profile: ", res);
            if (res.data) {
              this.prefillForm(res.data);
              this.profileInfo = res.data;
            }
          } else {
            this.notifyService.publishMessages(res.message, "danger", 1);
          }
        },
        (error) => log.debug("error: ", error)
      );
  }

  getProductDetailsFromServer(productId: number) {
    const productDetails$ = this.productsService.getProductDetails(productId);
    productDetails$.subscribe(
      (res: any) => {
        if (res.error === false) {
          if (res.data.relatedproduct) {
            this.relatedProducts = res.data.relatedproduct;
            this.relatedProducts = this.relatedProducts.slice(0, 4);
            log.debug("related: ", res.data);
          } else {
            this.relatedProducts = [];
          }
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }
}
