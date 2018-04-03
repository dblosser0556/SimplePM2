import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Vendor, Project } from '../../../models';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss']
})
export class VendorComponent implements OnInit, OnDestroy {
  @Input() project: Project;
  vendors = [];
  newVendorCounter = 0;
  constructor() { }

  ngOnInit() {

    // get a list of vendors that aren't being tracked
    // to easily set up tracking.
    const vendors = new Array<string>();
    for (const resource of this.project.resources) {
      const index = this.project.vendors.findIndex(v => v.vendorName === resource.vendor);
      if (index < 0  && resource.vendor !== null && resource.vendor !== '') {
        // add vendor
        vendors.push( resource.vendor);
      }
    }

    for (const fix of this.project.fixedPriceCosts) {
      const index = this.project.vendors.findIndex(v => v.vendorName === fix.vendor);
      if (index < 0 && fix.vendor !== null  && fix.vendor !== '') {
        if (vendors.findIndex(v => v === fix.vendor) < 0) {
          vendors.push(fix.vendor);
        }
      }
    }

    this.vendors = vendors;


   }
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

  addVendor(index: number) {
    const vendor = new Vendor();
    // keep track that this is a new vendor
    // by giving a negative vendor id.
    // on save it will updated.
    vendor.vendorId = --this.newVendorCounter;
    vendor.projectId = this.project.projectId;

    if (index >= 0) {
      vendor.vendorName = this.vendors[index];
    }

    // make sure vendor exists or will cause error on push
    if (this.project.vendors === null) {
      this.project.vendors = new Array<Vendor>();
    }

    // by pushing will add card to view.
    this.project.vendors.push(vendor);
  }

  deleteVendor(vendorId: any) {
    const nVendorId = Number(vendorId);
    const index = this.project.vendors.findIndex(v => v.vendorId === nVendorId);
    this.project.vendors.splice(index, 1);
    this.ngOnInit();
  }
}
