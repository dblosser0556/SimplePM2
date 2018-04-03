import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { Vendor } from '../../../../models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VendorService } from '../../../../services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vendor-contract-details',
  templateUrl: './vendor-contract-details.component.html',
  styleUrls: ['./vendor-contract-details.component.scss']
})
export class VendorContractDetailsComponent implements OnInit, OnChanges {

  @Input() vendor: Vendor;

  vendorForm: FormGroup;
  error: any;

  constructor(private vendorService: VendorService,
    private fb: FormBuilder,
    private toast: ToastrService) {
    this.createForm();
  }

  ngOnInit() { }

  ngOnChanges() {
    this.vendorForm.reset({
      vendorId: this.vendor.vendorId,
      vendorName: this.vendor.vendorName,
      contact: this.vendor.contact,
      contactPhone: this.vendor.contactPhone,
      contactEmail: this.vendor.contactEmail,
      contractIdentifier: this.vendor.contractIdentifier,
      contractTerms: this.vendor.contractTerms,
      contractAmount: this.vendor.contractAmount,
      contractEndDate: this.vendor.contractEndDate
    });
  }

  get vendorName() {
    return this.vendorForm.get('vendorName');
  }

  onSubmit() {
    this.vendorForm.updateValueAndValidity();
    if (this.vendorForm.invalid) {
      return;
    }

    const vendor: Vendor = this.getVendorFromFormValue(this.vendorForm.value);
    if (vendor.vendorId !== null) {
      this.vendorService.update(vendor.vendorId, vendor).subscribe(data => {
        this.toast.success('vendor has been updated');
      },
        error => {
          this.toast.error(error, 'Oops');
          console.log(error);
        });
    } else {

      vendor.vendorId = 0;
      this.vendorService.create(JSON.stringify(vendor)).subscribe(data => {
        this.vendor = data;
        this.ngOnChanges();
        this.toast.success('Vendor has been Added');
      },
        error => {
          this.toast.error(error, 'Oops');
          console.log(error);
        });
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
    vendor.projectId = this.vendor.projectId;
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


  revert() { this.ngOnChanges(); }

  cancel() { }
}
