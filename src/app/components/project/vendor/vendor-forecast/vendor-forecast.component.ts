import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Vendor, VendorInvoice, Project } from '../../../../models';
import * as moment from 'moment';
import { VendorInvoiceService } from '../../../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


export interface Forecast {
  periodDate: string;
  forecast: number;
  invoiceEstimate: number;
  invoiceAmount: number;
  index: number;
  type: string;
  comments: string;
}

export interface MonthDetail {
  periodDate: string;
  resourceDetails: MonthResourceDetail[];
  fixedDetails: MonthFixedDetail[];
}

export interface MonthResourceDetail {
  name: string;
  rate: number;
  plannedEffort: number;
  plannedAmount: number;
  actualEffort: number;
  actualAmount: number;
}

export interface MonthFixedDetail {
  name: string;
  plannedCost: number;
  actualCost: number;
}

@Component({
  selector: 'app-vendor-forecast',
  templateUrl: './vendor-forecast.component.html',
  styleUrls: ['./vendor-forecast.component.scss']
})
export class VendorForecastComponent implements OnInit, OnChanges {
  @Input() vendor: Vendor;
  @Input() project: Project;

  // handle the invoice popup to edit or add
  // invoices
  selectedInvoice: VendorInvoice = null;
  displayInvoice = false;
  invoiceForm: FormGroup;

  monthlyDetails: MonthDetail[];
  selectedMonthlyDetail: MonthDetail;
  displayMonthDetails = false;

  // initiate the diplayed values
  forecasts = [];
  forecastTotal = 0;
  estimateTotal = 0;
  invoiceTotal = 0;
  outstanding = 0;
  forecastRemaining = 0;
  estimatedRemaining = 0;
  invoiceRemaining = 0;

  constructor(private invoiceService: VendorInvoiceService,
    private fb: FormBuilder,
    private toast: ToastrService) {
    this.createForm();
  }

  ngOnInit() {

    // reset the totals for every refresh
    this.forecasts = [];
    this.forecastTotal = 0;
    this.estimateTotal = 0;
    this.invoiceTotal = 0;
    this.outstanding = 0;
    this.forecastRemaining = 0;
    this.estimatedRemaining = 0;
    this.invoiceRemaining = 0;

    let forecasts = new Array<Forecast>();
    let invoices = new Array<Forecast>();

    forecasts = this.calculateForecast();
    invoices = this.addInvoices();
    forecasts = forecasts.concat(invoices);
    forecasts.sort((leftSide, rightSide): number => {
      if (leftSide.periodDate < rightSide.periodDate) { return -1; }
      if (leftSide.periodDate > rightSide.periodDate) { return 1; }
      return 0;
    });
    this.forecastRemaining = this.vendor.contractAmount - this.forecastTotal;
    this.estimatedRemaining = this.vendor.contractAmount - this.estimateTotal;
    this.invoiceRemaining = this.vendor.contractAmount - this.invoiceTotal;
    this.outstanding = this.estimateTotal - this.invoiceTotal;
    this.forecasts = forecasts;
  }

  // from the list show the details
  showDetails(index: number) {
    const selectedRow = this.forecasts[index];
    if (selectedRow.type === 'invoice') {
      const record = this.vendor.invoices.findIndex(i => i.vendorInvoiceId === selectedRow.index);
      this.selectedInvoice = this.vendor.invoices[record];
      this.ngOnChanges();
      this.displayInvoice = true;
    } else {
      this.selectedMonthlyDetail = this.monthlyDetails[index];
      this.displayMonthDetails = true;
    }
  }

  // add a new invoice for this vendor
  addInvoice() {
    this.selectedInvoice = new VendorInvoice();
    this.selectedInvoice.vendorId = this.vendor.vendorId;
    this.selectedInvoice.invoiceDate = new Date();
    this.displayInvoice = true;
    this.ngOnChanges();
  }



  calculateForecast() {
    // go though all of the resource rows
    // find the input vendor and calculate
    // forecast and invoice estimates by period
    const forecasts = new Array<Forecast>();
    const monthlyDetails = new Array<MonthDetail>();

    // check to make this project has months
    if (this.project.months === undefined) {
      this.monthlyDetails = monthlyDetails;
      return forecasts;
    }


    for (let i = 0; i < this.project.months.length; i++) {
      let forecastTotal = 0;
      let estimateTotal = 0;
      const periodDate = moment(this.project.startDate()).add(this.project.months[i].monthNo, 'M').format('YY-MM');

      const monthlyResDetails = new Array<MonthResourceDetail>();
      for (const resource of this.project.resources) {
        if (resource.vendor === this.vendor.vendorName) {
          forecastTotal += resource.resourceMonths[i].plannedEffort * resource.rate;
          estimateTotal += resource.resourceMonths[i].actualEffort * resource.rate;

          // add the monthlyDetails
          const monthlyResDetail = {
            name: resource.resourceName,
            rate: resource.rate,
            plannedEffort: resource.resourceMonths[i].plannedEffort,
            plannedAmount: forecastTotal,
            actualEffort: resource.resourceMonths[i].actualEffort,
            actualAmount: estimateTotal
          };
          monthlyResDetails.push(monthlyResDetail);

        }
      }

      const monthlyFixDetails = new Array<MonthFixedDetail>();
      for (const fixed of this.project.fixedPriceCosts) {
        if (fixed.vendor === this.vendor.vendorName) {
          forecastTotal += fixed.fixedPriceMonths[i].plannedCost;
          estimateTotal += fixed.fixedPriceMonths[i].actualCost;

          // add the monthly details for the detail popup.
          const monthFixedDetail = {
            name: fixed.fixedPriceName,
            plannedCost: fixed.fixedPriceMonths[i].plannedCost,
            actualCost: fixed.fixedPriceMonths[i].actualCost
          };
          monthlyFixDetails.push(monthFixedDetail);
        }
      }


      const forecast = {
        periodDate: periodDate,
        forecast: forecastTotal,
        invoiceEstimate: estimateTotal,
        invoiceAmount: null,
        index: i,
        type: 'period',
        comments: null
      };
      forecasts.push(forecast);

      const monthDetail = {
        periodDate: periodDate,
        resourceDetails: monthlyResDetails,
        fixedDetails: monthlyFixDetails
      };
      monthlyDetails.push(monthDetail);

      this.forecastTotal += forecastTotal;
      this.estimateTotal += estimateTotal;

    }
    this.monthlyDetails = monthlyDetails;
    return forecasts;
  }

  addInvoices() {
    // go through all of the invoices and add to the
    // display array
    const invoices = new Array<Forecast>();
    let invoiceTotal = 0;

    if (this.vendor.invoices === undefined) {
      this.invoiceTotal = invoiceTotal;
      return invoices;
    }

    for (const inv of this.vendor.invoices) {
      const invoice = {
        periodDate: moment(inv.invoiceDate).format('YY-MM'),
        forecast: null,
        invoiceEstimate: null,
        invoiceAmount: inv.amount,
        index: inv.vendorInvoiceId,
        type: 'invoice',
        comments: inv.comments
      };
      invoices.push(invoice);
      invoiceTotal += inv.amount;
    }
    this.invoiceTotal = invoiceTotal;
    return invoices;
  }


  ngOnChanges() {
    // ensure the selected invoice has been created before
    // running reset
    if (this.selectedInvoice !== null) {
      this.invoiceForm.reset({
        vendorInvoiceId: this.selectedInvoice.vendorInvoiceId,
        vendorId: this.selectedInvoice.vendorId,
        amount: this.selectedInvoice.amount,
        comments: this.selectedInvoice.comments,
        invoiceDate: moment(this.selectedInvoice.invoiceDate).format('MM/DD/YY')
      });
    }
  }

  onSubmit() {
    this.invoiceForm.updateValueAndValidity();
    if (this.invoiceForm.invalid) {
      return;
    }

    const invoice: VendorInvoice = this.getPhaseFromFormValue(this.invoiceForm.value);
    if (invoice.vendorInvoiceId > 0) {
      this.invoiceService.update(invoice.vendorInvoiceId, invoice).subscribe(data => {
        this.toast.success('Selected Invoice has been updated');
        // reset the view to add invoice
        this.updateInvoices(data);
        this.ngOnInit();
        this.displayInvoice = false;
        this.selectedInvoice = null;
      }, error => {
        this.toast.error(error, 'Oops - Something went wrong');
        console.log(error);
      });
    } else {
      // set the invoice id to zero to make pass validation in the api
      invoice.vendorInvoiceId = 0;

      this.invoiceService.create(JSON.stringify(invoice)).subscribe(data => {

        this.toast.success('Invoice has been Added');
        // reset the view to add invoice
        this.updateInvoices(data);
        this.ngOnInit();
        this.selectedInvoice = null;
        this.displayInvoice = false;
      },
        error => {
          this.toast.error(error, 'Oops - Something went wrong');
          console.log(error);
        });
    }
  }

  updateInvoices(data: any) {
    const invoice = JSON.parse(data._body);
    const index = this.project.vendors.findIndex(v => v.vendorId === invoice.vendorId);

    const index2 = this.project.vendors[index].invoices.findIndex(i => i.vendorInvoiceId === invoice.vendorInvoiceId);
    // if found => update else add
    if (index2 >= 0) {
      this.project.vendors[index].invoices[index2] = Object.assign({}, invoice);
    } else {
      this.project.vendors[index].invoices.push(invoice);
    }
  }

  delete() {
    this.invoiceService.delete(this.selectedInvoice.vendorInvoiceId).subscribe(
      data => {
        // remove the invoice from the data structures.
        const index = this.project.vendors.findIndex(v => v.vendorId === this.selectedInvoice.vendorId);

        if (index >= 0) {
          const index2 = this.project.vendors[index].invoices.findIndex(i =>
            i.vendorInvoiceId === this.selectedInvoice.vendorInvoiceId);

          if (index2 >= 0) {
            this.project.vendors[index].invoices.splice(index2, 1);
          }
        }
        this.toast.success('Invoice deleted');
        // refresh the list
        this.ngOnInit();
        this.selectedInvoice = null;
        this.displayInvoice = false;
      }, error => {
        this.toast.error(error, 'Oops');
        console.log(error);
      }
    );
  }
  getPhaseFromFormValue(formValue: any): VendorInvoice {

    const selectedInvoice = new VendorInvoice();

    selectedInvoice.vendorInvoiceId = formValue.vendorInvoiceId;
    selectedInvoice.vendorId = formValue.vendorId;
    selectedInvoice.amount = formValue.amount;
    selectedInvoice.comments = formValue.comments;
    selectedInvoice.invoiceDate = formValue.invoiceDate;
    return selectedInvoice;

  }

  createForm() {
    this.invoiceForm = this.fb.group({
      vendorInvoiceId: '',
      vendorId: ['', Validators.required],
      amount: ['', Validators.required],
      comments: '',
      invoiceDate: ['', Validators.required]
    });
  }

  get invoiceDate() {
    return this.invoiceForm.get('invoiceDate');
  }
  get amount() {
    return this.invoiceForm.get('amount');
  }

  revert() { this.ngOnChanges(); }

  cancel() {
  this.displayMonthDetails = false;
    this.displayInvoice = false;
    this.selectedInvoice = null;
    this.selectedMonthlyDetail = null;
  }
}
