import { VendorInvoice } from './vendorInvoice';
import { VendorPeriod } from './vendorPeriod';

export class Vendor {
    vendorId: number = null;
    vendorName: string = null;
    contact: string = null;
    contactPhone: string = null;
    contactEmail: string = null;
    contractIdentifier: string = null;
    contractTerms: string = null;
    contractAmount: number = null;
    contractEndDate: Date = null;

    projectId: number = null;

    periodEstimates: VendorPeriod[] = [];
    invoices: VendorInvoice[] = [];

    constructor(protected instanceData?: Vendor) {
        if (instanceData) {
            this.deserialize(instanceData);
        }
    }

    private deserialize(instanceData: Vendor) {

        const keys = Object.keys(instanceData);

        for (const key of keys) {
            if (key === 'periodEstimates') {
                this.periodEstimates = (instanceData[key] != null) ? instanceData[key].map(d => new VendorPeriod(d)) : [];
            } else if (key === 'invoices') {
                this.invoices = (instanceData[key] != null) ? instanceData[key].map(d => new VendorInvoice(d)) : [];
            } else {
                this[key] = instanceData[key];
            }

        }
    }
}
