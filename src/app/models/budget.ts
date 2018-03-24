
export enum BudgetType {
    Capital = 0,
    Expense = 1
}
export class Budget {
    budgetId: number;
    budgetType: BudgetType;
    approvedDateTime: string;
    amount: number;
    projectId: number;



    constructor(private instanceData?: Budget) {
        if (instanceData) {
            this.deserialize(instanceData);
        }
    }

    private deserialize(instanceData: Budget) {
        // Note this.active will not be listed in keys since it's declared, but not defined
        const keys = Object.keys(instanceData);

        for (const key of keys) {
            if (key === 'budgetType') {
                if (instanceData[key] === 0 ) {
                    this.budgetType = BudgetType.Capital;
                } else {
                    this.budgetType = BudgetType.Expense;
                }
            } else {
                this[key] = instanceData[key];
            }
        }
    }
}
