export interface ProjectList {
    projectId: number;
    projectName: string;
    projectDesc?: string;
    projectManager?: string;
    projectManagerName?: string;
    plannedStartDate: string;
    plannedStartYear: string;
    actualStartDate?: string;
    actualStartYear?: string;
    filterYear: string;
    groupId: number;
    statusId: number;
    groupName: string;
    groupManager?: string;
    statusName: string;
    totalPlannedExpense: number;
    totalActualExpense: number;
    totalPlannedCapital: number;
    totalActualCapital: number;
    totalExpenseBudget: number;
    totalCapitalBudget: number;
}
