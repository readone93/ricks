import { Logger } from "src/services/core/logger/logger.service";
import { CartService } from "./../../classes/cart/cart.service";
import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { retry, catchError, tap, finalize, delay } from "rxjs/operators";

import { LoaderService } from "../../classes/loader/loader.service";
import { Router } from "@angular/router";
import { NotificationsService } from "../../classes/notifications/notifications.service";
import { CredentialsService } from "src/app/authentication/credentials/credentials.service";

const log = new Logger("HTTP");
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  errorMessage: string;
  constructor(
    private loaderService: LoaderService,
    private router: Router,
    private cartService: CartService,
    private credentialsService: CredentialsService,
    private notification: NotificationsService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.loaderService.show();

    return next.handle(request).pipe(
      tap((evt) => {
        // custom api errors
        if (evt instanceof HttpResponse) {
          this.loaderService.hide();
          if (evt.body !== null) {
            if (evt.body.error == true) {
              this.errorMessage = evt.body.message;
              if (evt.body.message === "Unauthenticated.") {
                this.logout();
                location.reload();
                this.notification.publishMessages(
                  "Please log in",
                  "warning",
                  1
                );
              } else {
                // this.notification.publishMessages(this.errorMessage, 'danger', 1);
              }
            }
          }

          log.debug("evt", evt);
        }
      }),

      catchError((error: HttpErrorResponse) => {
        this.loaderService.hide();
        log.debug(error);

        if (error.error instanceof ErrorEvent) {
          //client-side error
          // this.errorMessage = `Error: ${error.error.message}`;
          log.debug("hEre");
        } else {
          // server-side error

          switch (error.status) {
            case 503: {
              this.errorMessage =
                "An Internal Error Occured. Our Engineers Have Been Contacted";
              this.notification.publishMessages(this.errorMessage, "danger", 1);
              break;
            }
            case 500: {
              this.errorMessage =
                "An Internal Error Occured. Our Engineers Have Been Contacted";
              this.notification.publishMessages(this.errorMessage, "danger", 1);
              break;
            }
            case 400: {
              this.errorMessage =
                "An Error Occured While Processing Your Request. Please Try Again";
              if (error.error.error == "invalid_grant") {
                this.notification.publishMessages(
                  error.error["errorDescription"],
                  "danger",
                  1
                );
              } else if (error.error.message == "Incorrect email or password") {
                this.notification.publishMessages(
                  "Incorrect email or password",
                  "danger",
                  1
                );
              } else {
                this.notification.publishMessages(
                  this.errorMessage,
                  "danger",
                  1
                );
              }
              break;
            }
            case 404: {
              this.errorMessage =
                "An Error Occured While Processing Your Request. Please Try Again";
              this.notification.publishMessages(this.errorMessage, "danger", 1);
              break;
            }
            case 401: {
              this.notification.publishMessages(
                error.error.message,
                "danger",
                1
              );
              this.logout();
              break;
            }
            case 405: {
              this.errorMessage =
                "An Error Occured While Processing Your Request. Please Try Again";
              this.notification.publishMessages(this.errorMessage, "danger", 1);
              break;
            }
            case 0: {
              this.errorMessage =
                "A Connection Error Occured. Please Check Your Network Connection";
              this.notification.publishMessages(this.errorMessage, "danger", 1);
              break;
            }
          }
        }

        return throwError(error.error);
      })
    );
  }

  logout() {
    this.credentialsService.setCredentials();
    this.router.navigate(["/"]);
    // this.cartService.clearCart();
  }
}
