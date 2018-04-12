import { Pipe, PipeTransform } from '@angular/core';
import { ProjectMonthlyProjection, Group } from '../models';

@Pipe({
    name: 'projectGroupFilter',
    pure: false
})

export class ProjectGroupFilterPipe implements PipeTransform {
    transform(items: ProjectMonthlyProjection[], filter: Group): any {
        if (!items || !filter === null) {
            return items;
        }
        return items.filter(item => (item.lft <= filter.lft && item.rgt >= filter.rgt)) ;
    }
}
