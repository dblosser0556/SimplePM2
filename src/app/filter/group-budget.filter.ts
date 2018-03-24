import { Pipe, PipeTransform } from '@angular/core';
import { GroupBudget, BudgetType } from '../models';

@Pipe({
    name: 'groupBudgetFilter',
    pure: false
})

export class GroupBudgetFilterPipe implements PipeTransform {
    transform(items: GroupBudget[], filter: BudgetType): any {
        if (!items || !filter === null) {
            return items;
        }
        return items.filter(item => item.budgetType === filter);
    }
}
