import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Vendor, VendorInvoice, Project } from '../../../../models';
import { VendorForecastComponent } from '../vendor-forecast/vendor-forecast.component';


@Component({
  selector: 'app-vendor-card',
  templateUrl: './vendor-card.component.html',
  styleUrls: ['./vendor-card.component.scss']
})
export class VendorCardComponent implements OnInit {
  @Input() vendor: Vendor;
  @Input() project: Project;
  @Output() vendorCancel = new EventEmitter();

  @ViewChild(VendorForecastComponent) forecast: VendorForecastComponent;
  showView = 'forecast';

  constructor() { }

  ngOnInit() {
    if (this.vendor.vendorId < 0) {
      this.showView = 'contract';
    } else {
      this.showView = 'forecast';
    }
  }

  addInvoice() {
    this.forecast.addInvoice();
  }

  // recieve cancel from detials
  addCancelled(event: any) {

    // pass cancel to vendor component
    this.vendorCancel.emit(event);

  }
}
