import {ResourceMonth} from './resource-month';

export class Resource {
    resourceMonths: ResourceMonth[] = [];

    projectId: number = null;
    resourceId: number = null;

    resourceName: string = null;
    rate: number = null;
    vendor: string = null;

    roleId: number = null;
    roleName: string = null;
    resourceTypeId: number = null;
    resourceTypeName: string = null;
    totalPlannedEffort: number = null;
    totalActualEffort: number = null;

    constructor(protected instanceData?: Resource) {
        if (instanceData) {
            this.deserialize(instanceData);
        }
    }
    private deserialize(instanceData: Resource) {
        
        const keys = Object.keys(instanceData);

        for (const key of keys) {
            if (key === 'resourceMonths') {
                this.resourceMonths = instanceData[key].map(data => new ResourceMonth(data));
            } else {
                this[key] = instanceData[key];
            }

        }
    }

}
