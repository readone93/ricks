import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

import { CredentialsService } from "../credentials/credentials.service";
import { Logger } from "src/services/core/logger/logger.service";

const log = new Logger("AuthGuard");

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private credentialsService: CredentialsService,
    private notifyService: NotificationsService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.credentialsService.isAuthenticated()) {
      return true;
    }

    log.debug("Not authenticated, redirecting and adding redirect url...");
    this.notifyService.publishMessages("Kindly login to proceed", "warning", 1);
    this.credentialsService.setCredentials();
    this.router.navigate(["/"]);
    return false;
  }
}
