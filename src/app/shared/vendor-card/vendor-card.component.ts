import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-vendor-card",
  templateUrl: "./vendor-card.component.html",
  styleUrls: ["./vendor-card.component.css"],
})
export class VendorCardComponent implements OnInit {
  @Input() vendor: any;
  @Output() sendVendorId = new EventEmitter<number>();
  constructor() {}

  ngOnInit() {}

  sendVendorIdToParent(vendorId: number) {
    this.sendVendorId.emit(vendorId);
  }
}
