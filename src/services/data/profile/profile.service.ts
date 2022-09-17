import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { BaseService } from "./../../core/base/base.service";
import { Injectable } from "@angular/core";
import { Profile } from "src/services/classes/models/profile";
import { ContactForm } from "src/services/classes/models/contact-form";

const routes = {
  profile: "users/profile",
  contact: "guest/contact",
};

@Injectable({
  providedIn: "root",
})
export class ProfileService extends BaseService<any> {
  constructor(http: HttpClient) {
    super(http);
  }

  getUserProfile(): Observable<any> {
    return this.sendGet(this.baseUrl(routes.profile));
  }

  updateProfile(payload: FormData): Observable<any> {
    return this.sendPost(this.baseUrl(routes.profile), payload);
  }

  contactAdmin(payload: ContactForm) {
    return this.sendPost(this.baseUrl(routes.contact), payload);
  }
}
