import { Router } from "@angular/router";
import { Logger } from "./../../../services/core/logger/logger.service";
import { VendorService } from "./../../../services/data/vendor/vendor.service";
import { NotificationsService } from "./../../../services/classes/notifications/notifications.service";
import { CredentialsService } from "./../../authentication/credentials/credentials.service";
import { Component, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material";

const log = new Logger("Vendors");
@Component({
  selector: "app-vendors",
  templateUrl: "./vendors.component.html",
  styleUrls: ["./vendors.component.css"],
})
export class VendorsComponent implements OnInit {
  vendors: any[] = [];
  pageSizeOptions: number[] = [5, 10, 20, 30, 50, 100];
  pageEvent: PageEvent = {
    length: 0,
    pageIndex: 1,
    pageSize: 10,
  };

  constructor(
    private credentialsService: CredentialsService,
    private router: Router,
    private notifyService: NotificationsService,
    private vendorsService: VendorService
  ) {}

  ngOnInit() {
    this.getAllVendors();
  }

  onPageChange(event: PageEvent) {
    this.pageEvent = { ...this.pageEvent, ...event };
    let { pageSize, pageIndex } = this.pageEvent;
    pageIndex = pageIndex + 1;
    this.getAllVendors(pageIndex, pageSize);

    window.scrollTo(0, 0);
    log.debug("page event triggered", pageIndex, pageSize);
  }

  getAllVendors(currentPage = 1, pageSize = 12) {
    const vendors$ = this.vendorsService.getAllVendors(currentPage, pageSize);
    vendors$.subscribe(
      (res: any) => {
        if (res.error === false) {
          if (res.data !== null) {
            this.pageEvent.pageSize = res.data.per_page;
            this.pageEvent.pageIndex = res.data.current_page;
            this.pageEvent.length = res.data.total;
            log.debug("vendors: ", res.data);
            this.vendors = res.data.data;
            localStorage.setItem("all-vendors", JSON.stringify(this.vendors));
          } else {
            this.vendors = [];
          }
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }

  goToVendorStore(e: any, vendor: any) {
    log.debug("vendorId: ", e);
    const { firstname, lastname, store_name } = vendor;
    const vendorDeets = {
      firstname,
      lastname,
      store_name,
    };
    sessionStorage.setItem("vendor", JSON.stringify(vendorDeets));
    this.router.navigate(["/", "vendor-products", e]);
  }
}
