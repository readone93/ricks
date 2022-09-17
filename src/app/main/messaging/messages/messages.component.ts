import { VendorService } from "./../../../../services/data/vendor/vendor.service";
import { NotificationsService } from "./../../../../services/classes/notifications/notifications.service";
import { Router } from "@angular/router";
import { Logger } from "./../../../../services/core/logger/logger.service";
import { MessagingService } from "./../../../../services/data/messaging/messaging.service";
import { Component, OnInit } from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTableDataSource } from "@angular/material/table";

const log = new Logger("Messages");

export interface PeriodicElement {
  customerName: string;
  id: number;
  message: string;
  date: string;
  actionUrl: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    id: 1,
    customerName: "Fayemi David",
    message:
      "Package not delivered - Hi, I haven’t gotten my package yet. May I know what the ....",
    date: "01  Sept 2020 18:52  AM",
    actionUrl: "assets/images/eva_more-vertical-fill.svg",
  },
  {
    id: 2,
    customerName: "Fayemi David",
    message:
      "Package not delivered - Hi, I haven’t gotten my package yet. May I know what the ....",
    date: "01  Sept 2020 18:52  AM",
    actionUrl: "assets/images/eva_more-vertical-fill.svg",
  },
  {
    id: 2,
    customerName: "Fayemi David",
    message:
      "Package not delivered - Hi, I haven’t gotten my package yet. May I know what the ....",
    date: "01  Sept 2020 18:52  AM",
    actionUrl: "assets/images/eva_more-vertical-fill.svg",
  },
  {
    id: 4,
    customerName: "Fayemi David",
    message:
      "Package not delivered - Hi, I haven’t gotten my package yet. May I know what the ....",
    date: "01  Sept 2020 18:52  AM",
    actionUrl: "assets/images/eva_more-vertical-fill.svg",
  },
  {
    id: 5,
    customerName: "Fayemi David",
    message:
      "Package not delivered - Hi, I haven’t gotten my package yet. May I know what the ....",
    date: "01  Sept 2020 18:52  AM",
    actionUrl: "assets/images/eva_more-vertical-fill.svg",
  },
];

@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.css"],
})
export class MessagesComponent implements OnInit {
  allVendors: any[] = [];

  constructor(
    private messageService: MessagingService,
    private router: Router,
    private notifyService: NotificationsService,
    private vendorsService: VendorService
  ) {}

  ngOnInit() {
    this.getAllMessages();
    this.getAllVendors();
  }

  displayedColumns: string[] = [
    // "select",
    "customerName",
    "message",
    "date",
    // "actionUrl",
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
      row.id + 1
    }`;
  }

  getAllMessages() {
    const msgs$ = this.messageService.getMessages();
    msgs$.subscribe(
      (res: any) => {
        if (res.error === false) {
          log.debug("res: ", res);
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }

  getAllVendors() {
    const vendors$ = this.vendorsService.getAllVendors();
    vendors$.subscribe(
      (res: any) => {
        if (res.error === false) {
          log.debug("vendors: ", res.data);
          this.getAllVendors = res.data;
        } else {
          this.notifyService.publishMessages(res.message, "danger", 1);
        }
      },
      (error) => log.debug("error: ", error)
    );
  }
}
