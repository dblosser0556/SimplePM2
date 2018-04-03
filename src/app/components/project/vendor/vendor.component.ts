import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Vendor, Project } from '../../../models';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss']
})
export class VendorComponent implements OnInit, OnDestroy {
  @Input() project: Project;
  newVendorCounter = 0;
  constructor() { }

  ngOnInit() { }
  ngOnDestroy() {
    // go through the count of new vendors
    // if they don't have a legitimate vendor id then remove
    // them
    for (let i = 0; i > this.newVendorCounter; i--) {
      const index = this.project.vendors.findIndex(v => v.vendorId === i);
      // if found
      if (index > 0) {
        this.project.vendors.slice(index, 1);
      }
    }

  }
  addVendor() {
    const vendor = new Vendor();
    // keep track that this is a new vendor
    // by giving a negative vendor id.
    // on save it will updated.
    vendor.vendorId = --this.newVendorCounter;
    vendor.projectId = this.project.projectId;

    // make sure vendor exists or will cause error on push
    if (this.project.vendors === null) {
      this.project.vendors = new Array<Vendor>();
    }

    // by pushing will add card to view.
    this.project.vendors.push(vendor);
  }

  deleteVendor(vendorId: number) {
    const index = this.project.vendors.findIndex(v => v.vendorId === vendorId);
    this.project.vendors.slice(index, 1);
  }
}
