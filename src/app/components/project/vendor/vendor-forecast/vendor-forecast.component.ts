import { Component, OnInit, Input } from '@angular/core';
import { Vendor, VendorInvoice, Project } from '../../../../models';

export interface Forecast {
  periodDate: Date;
  forecast: number;
  invoiceEstimate: number;
  invoiceAmount: number;
  index: number;
  type: string;
  comments: string;
}

export interface MonthDetail {
  periodDate: Date;
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
export class VendorForecastComponent implements OnInit {
  @Input() vendor: Vendor;
  @Input() project: Project;
  selectedInvoice: VendorInvoice;
  displayInvoice = false;

  monthlyDetails: MonthDetail[];
  selectedMontlyDetail: MonthDetail;
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

  constructor() { }

  ngOnInit() {
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
      this.selectedInvoice = this.vendor.invoices[selectedRow.index];
      this.displayInvoice = true;
    } else {
      this.selectedMontlyDetail = this.monthlyDetails[index];
      this.displayMonthDetails = true;
    }
  }

  // add a new invoice for this vendor
  addInvoice() {
    this.selectedInvoice = new VendorInvoice();
    this.selectedInvoice.vendorId = this.vendor.vendorId;
    this.displayInvoice = true;
  }

  onSubmit() {

  }

  calculateForecast() {
    // go though all of the resource rows
    // find the input vendor and calculate
    // forecast and invoice estimates by period
    const forecasts =  new Array<Forecast>();
    const monthlyDetails = new Array<MonthDetail>();

    for (let i = 0; i < this.project.months.length; i++) {
      let forecastTotal = 0;
      let estimateTotal = 0;
      const periodDate = this.project.startDate();

      const monthlyResDetails = new Array<MonthResourceDetail>();
      for (const resource of this.project.resources) {
        if (resource.vendor === this.vendor.vendorName) {
          forecastTotal = resource.resourceMonths[i].plannedEffort * resource.rate;
          estimateTotal = resource.resourceMonths[i].actualEffort * resource.rate;

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
          forecastTotal = fixed.fixedPriceMonths[i].plannedCost;
          estimateTotal = fixed.fixedPriceMonths[i].actualCost;

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
    for (const inv of this.vendor.invoices) {
      const invoice = {
        periodDate: inv.invoiceDate,
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
}
