export class Milestone {
    milestoneId: number;
    active: boolean;
    setDateTime: Date;
    phaseId: number;
    phaseCompleteDate: Date;
    phaseCapitalEstimate: number;
    phaseExpenseEstimate: number;

    projectId: number;

    constructor(private instanceData?: Milestone) {
        if (instanceData) {
            this.deserialize(instanceData);
        }
    }

    private deserialize(instanceData: Milestone) {
        // Note this.active will not be listed in keys since it's declared, but not defined
        const keys = Object.keys(instanceData);

        for (const key of keys) {
                this[key] = instanceData[key];
        }
    }
}
