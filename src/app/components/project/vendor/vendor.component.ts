import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Vendor, Project } from '../../../models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VendorService } from '../../../services';
@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss']
})
export class VendorComponent implements OnInit, OnChanges {
  vendor = new Vendor();
  @Input() project: Project;
  showEditDetails = false;


  vendorForm: FormGroup;
  error: any;

  constructor(private vendorService: VendorService,
    private fb: FormBuilder) {
      this.createForm();
     }

  ngOnInit() {}

  ngOnChanges() {
    this.vendorForm.reset( {
      vendorId: this.vendor.vendorId,
      vendorName: this.vendor.vendorName,
      contact: this.vendor.contact,
      contactPhone: this.vendor.contactPhone,
      contactEmail: this.vendor.contactEmail,
      contractIdentifier: this.vendor.contractIdentifier,
      contractTerms: this.vendor.contractTerms,
      contractAmount: this.vendor.contractAmount,
      contractEndDate: this.vendor.contractEndDate });
  }

  onSubmit() {
    this.vendorForm.updateValueAndValidity();
    if (this.vendorForm.invalid) {
      return;
    }

    const vendor: Vendor = this.getVendorFromFormValue(this.vendorForm.value);
    if (vendor.vendorId !== null) {
      this.vendorService.update(vendor.vendorId, vendor).subscribe(data => {

          // this.snackBar.open('vendor has been updated', '', {duration: 2000});
        this.showEditDetails = false;
      });
    } else {

      vendor.vendorId = 0;
      this.vendorService.create(JSON.stringify(vendor)).subscribe(data => {
        // this.resetForm();
        this.vendor = data;

        //  this.snackBar.open('vendor has been Added', '', {duration: 2000});
        this.showEditDetails = false;
      },
      error => this.error = error);
    }
  }

  getVendorFromFormValue(formValue: any): Vendor {
    let vendor: Vendor;
    vendor = new Vendor();

    vendor.vendorId = formValue.vendorId;
    vendor.vendorName = formValue.vendorName;
    vendor.contact = formValue.contact;
    vendor.contactPhone = formValue.contactPhone;
    vendor.contactEmail = formValue.contactEmail;
    vendor.contractIdentifier = formValue.contractIdentifier;
    vendor.contractTerms = formValue.contractTerms;
    vendor.contractAmount = formValue.contractAmount;
    vendor.contractEndDate = formValue.contractEndDate;
    vendor.projectId = this.project.projectId;
    return vendor;

  }

  createForm() {
    this.vendorForm = this.fb.group({
      vendorId: '',
      vendorName: ['', Validators.required],
      contact: '',
      contactPhone: '',
      contactEmail: '',
      contractIdentifier: '',
      contractTerms: '',
      contractAmount: '',
      contractEndDate: ''
    }
    );
  }

  add() {
    this.vendor = new Vendor();
    this.ngOnChanges();
    this.showEditDetails = true;
  }

  edit(vendor: Vendor) {
    this.vendor = vendor;
    this.ngOnChanges();
    this.showEditDetails = true;
  }

  revert() {this.ngOnChanges(); }

  cancel() { this.showEditDetails = false; }
}
