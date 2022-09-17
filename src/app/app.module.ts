import { environment } from "src/environments/environment";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpErrorInterceptor } from "src/services/interceptors/Base/http-interceptor";
import { TokenInterceptor } from "src/services/interceptors/Token/token";
import { SharedModule } from "./shared/shared.module";
import {
  GoogleLoginProvider,
  AuthService,
  AuthServiceConfig,
} from "angular-6-social-login";

export function socialConfigs() {
  const config = new AuthServiceConfig([
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(environment.googleProvider),
    },
  ]);
  return config;
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    AuthService,
    {
      provide: AuthServiceConfig,
      useFactory: socialConfigs,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
