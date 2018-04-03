export class VendorPeriod  {
        vendorPeriodId: number = null;
        vendorId: number = null;
        periodNo: number = null;
        periodEstimate: number = null;

        constructor(protected instanceData?: VendorPeriod) {
            if (instanceData) {
                this.deserialize(instanceData);
            }
        }

        private deserialize(instanceData: VendorPeriod) {

            const keys = Object.keys(instanceData);

            for (const key of keys) {
                this[key] = instanceData[key];
            }

        }
    }