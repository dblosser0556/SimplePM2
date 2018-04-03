export class VendorInvoice {
    vendorInvoiceId: number = null;
    invoiceDate: Date = null;
    amount: number = null;
    comments: string = null;

    vendorId: number = null;


    constructor(protected instanceData?: VendorInvoice) {
        if (instanceData) {
            this.deserialize(instanceData);
        }
    }

    private deserialize(instanceData: VendorInvoice) {

        const keys = Object.keys(instanceData);

        for (const key of keys) {
            this[key] = instanceData[key];
        }

    }
}
