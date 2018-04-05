import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Vendor, Project } from '../../../../models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VendorService } from '../../../../services';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Component({
  selector: 'app-vendor-contract-details',
  templateUrl: './vendor-contract-details.component.html',
  styleUrls: ['./vendor-contract-details.component.scss']
})
export class VendorContractDetailsComponent implements OnInit, OnChanges {

  @Input() vendor: Vendor;
  @Input() project: Project;
  @Output() cancelAddVendor = new EventEmitter();


  vendorForm: FormGroup;
  showDeleteConf = false;
  
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
      contractEndDate: moment(this.vendor.contractEndDate).format('MM/DD/YYYY')
    });
  }

 
  onSubmit() {
    this.vendorForm.updateValueAndValidity();
    if (this.vendorForm.invalid) {
      return;
    }

    const vendor: Vendor = this.getVendorFromFormValue(this.vendorForm.value);
    if (vendor.vendorId > 0) {
      // vendor exists do update.
      this.vendorService.update(vendor.vendorId, vendor).subscribe(data => {
        this.toast.success('vendor has been updated');
       
        this.vendor = JSON.parse(data._body);
        this.updateVendor();
      },
        error => {
          this.toast.error(error, 'Oops');
          console.log(error);
        });
    } else {
      // this is a new item.  It get passed with a negative number.
      // passing 0 works with the api post.
      vendor.vendorId = 0;
      this.vendorService.create(JSON.stringify(vendor)).subscribe(data => {
        
        // store the place holder from the array
        const tempVendorId = this.vendor.vendorId;
        
        
        // add this new vendor to the vendor array
        this.vendor = JSON.parse(data._body);
        this.updateVendor();

        // update the form with the changes
        this.ngOnChanges();

        // remove the place holder.
        this.cancelAddVendor.emit(tempVendorId);

        this.toast.success('Vendor has been Added');
      },
        error => {
          this.toast.error(error, 'Oops');
          console.log(error);
        });
    }
  }

  updateVendor() {
    const index = this.project.vendors.findIndex(v => v.vendorId === this.vendor.vendorId);
    if (index >= 0) {
      this.project.vendors[index] = Object.assign({}, this.vendor);
    } else {
      this.project.vendors.push(this.vendor);
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
      contractAmount: ['', Validators.required],
      contractEndDate: ['', Validators.required]
    }
    );
  }

  // set up some validation shortcut helpers
  get vendorName() {
    return this.vendorForm.get('vendorName');
  }
  
  get contractAmount() {
    return this.vendorForm.get('contractAmount');
  }

  get contractEndDate() {
    return this.vendorForm.get('contractEndDate');
  }

  revert() { this.ngOnChanges(); }

  cancel() {
      this.cancelAddVendor.emit(this.vendor.vendorId.toString());
   }

  confirmDelete() {
    this.showDeleteConf = true;
  }

  onDelete() {
    
    this.vendorService.delete(this.vendor.vendorId)
      .subscribe(x => {
        this.toast.success('Vendor has been deleted', 'Success');
        this.cancelAddVendor.emit(this.vendor.vendorId.toString());
        this.showDeleteConf = false;
      },
        error => {
          this.toast.error(error);
          console.log(error);
          this.showDeleteConf = false;
        });
  }
}
