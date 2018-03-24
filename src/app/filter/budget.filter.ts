import { Pipe, PipeTransform } from '@angular/core';
import { Budget, BudgetType } from '../models';

@Pipe({
    name: 'budgetFilter',
    pure: false
})

export class BudgetFilterPipe implements PipeTransform {
    transform(items: Budget[], filter: BudgetType): any {
        if (!items || !filter === null) {
            return items;
        }
        return items.filter(item => item.budgetType === filter);
    }
}
