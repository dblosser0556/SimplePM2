export class ResourceMonth {
    
    resourceMonthId: number = null;
    monthNo: number = null;
    plannedEffort: number = null;
    plannedEffortCapPercent: number = null;
    plannedEffortStyle: number = null;
    plannedEffortInError: boolean = false;
    actualEffort: number = null;
    actualEffortCapPercent: number = null;
    actualEffortStyle: number = null;
    actualEffortInError: boolean = false;
    

    resourceId: number = null;

    constructor(protected instanceData?: ResourceMonth) {
        if (instanceData) {
            this.deserialize(instanceData);
        }
    }

    private deserialize(instanceData: ResourceMonth) {
        // Note this.active will not be listed in keys since it's declared, but not defined
        const keys = Object.keys(instanceData);

        for (const key of keys) {

            this[key] = instanceData[key];

        }
    }
}
