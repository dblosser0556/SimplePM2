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
                this.periodEstimates = instanceData[key].map(data => new VendorPeriod(data));
            } else if (key === 'invoices') {
                this.invoices = instanceData[key].map(data => new VendorInvoice(data));
            } else {
                this[key] = instanceData[key];
            }

        }
    }
}
