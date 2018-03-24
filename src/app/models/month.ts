export class Month {
    projectId: number = null;
    monthId: number = null;
    monthNo: number = null;
    phaseId: number = null;
    phaseName: string = null;
    totalPlannedExpense: number = null;
    totalPlannedCapital: number = null;
    totalActualExpense: number = null;
    totalActualCapital: number = null;

    constructor(protected monthsData?: Month) {
        if (monthsData) {
            this.deserialize(monthsData);
        }
    }

    private deserialize(monthsData: Month) {
        // Note this.active will not be listed in keys since it's declared, but not defined
        const keys = Object.keys(monthsData);

        for (const key of keys) {
            this[key] = monthsData[key];
        }
    }

    phaseDate(startDate: Date) {
        return startDate.setMonth(startDate.getMonth() + this.monthNo).toLocaleString('mmm/yy');
    }


}
