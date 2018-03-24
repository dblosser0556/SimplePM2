import { GroupBudget } from '.';

export class Group {
    groupId: number;
    parentId: number;
    parentName: string;

    level: number;
    levelDesc: string;
    levelId = 0;
    lft = 0;
    rgt = 0;

    groupName: string;
    groupDesc: string;
    groupManager: string;
    groupManagerName: string;

    groupBudgets: GroupBudget[];

}
