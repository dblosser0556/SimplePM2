import { FixedPriceMonth } from './fixed-price-month';

export class FixedPrice {
    fixedPriceMonths: FixedPriceMonth[] = [];

    fixedPriceId: number = null;
    
    fixedPriceName: string = null;
    vendor: string = null;
    fixedPriceTypeId: number = null;
    fixedPriceTypeName: string = null;
    resourceTypeId: number = null;
    resourceTypeName: string = null;
    totalPlannedCost: number = 0;
    totalActualCost: number = 0;

    projectId: number = null;

   

    constructor(protected monthsData?: FixedPrice) {
        if (monthsData) {
            this.deserialize(monthsData);
        }
    }

    private deserialize(monthsData: FixedPrice) {
        // Note this.active will not be listed in keys since it's declared, but not defined
        const keys = Object.keys(monthsData);

        for (const key of keys) {
            if (key === 'fixedPriceMonths'){
                this.fixedPriceMonths = monthsData[key].map(data => new FixedPriceMonth(data));
            } else {
                this[key] = monthsData[key];
            }
        }
    }
}
