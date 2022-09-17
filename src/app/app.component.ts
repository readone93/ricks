import { Component } from "@angular/core";
import { environment } from "src/environments/environment";
import { Logger } from "src/services/core/logger/logger.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "Aduaba Customer";

  ngOnInit() {
    if (environment.production) {
      Logger.enableProductionMode();
    }
  }
}
