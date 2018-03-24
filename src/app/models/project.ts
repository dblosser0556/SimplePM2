import { Budget } from './budget';
import { Resource } from './resource';
import { Month } from './month';
import { FixedPrice } from './fixed-price';
import { ResourceLoader } from '@angular/compiler';

export class Project {
    budgets: Budget[] = [];
    months: Month[] = [];
    resources: Resource[] = [];
    fixedPriceCosts: FixedPrice[] = [];
    isTemplate: boolean = null;
    projectId: number = null;
    projectName: string = null;
    projectDesc: string = null;
    projectManager: string = null;
    plannedStartDate: string = null;
    actualStartDate: string = null;
    groupId: number = null;
    groupName: string = null;
    groupManager: string = null;
    statusId: number = null;
    statusName: string = null;

    constructor(protected instanceData?: Project) {
        if (instanceData) {
            this.deserialize(instanceData);
        }
    }

    startDate(): Date {
        if (this.actualStartDate != null) {
            return (this.getDate(this.actualStartDate));
        } else {
            return (this.getDate(this.plannedStartDate));
        }
    }

    private getDate(pdate: any) {

        if (pdate instanceof Date) {
            return pdate;
        }
        const _date: string = pdate;
        const _dates = _date.split('-');
        const _year = Number(_dates[0]);
        let _month = 1;
        switch (_dates[1]) {
            case 'Jan':
                _month = 1;
                break;
            case 'Feb':
                _month = 2;
                break;
            case 'Mar':
                _month = 3;
                break;
            case 'Apr':
                _month = 4;
                break;
            case 'May':
                _month = 5;
                break;
            case 'Jun':
                _month = 6;
                break;
            case 'Jul':
                _month = 7;
                break;
            case 'Aug':
                _month = 8;
                break;
            case 'Sep':
                _month = 9;
                break;
            case 'Oct':
                _month = 10;
                break;
            case 'Nov':
                _month = 11;
                break;
            case 'Dec':
                _month = 12;
                break;
            default:
                _month = Number(_dates[1]);
        }
        return new Date(_year, _month, 1);

    }

    private deserialize(instanceData: Project) {
        // Note this.active will not be listed in keys since it's declared, but not defined
        const keys = Object.keys(instanceData[0]);

        for (const key of keys) {
            {
                const data = instanceData[0][key];
                switch (key) {
                    case 'fixedPriceCosts':
                        this.fixedPriceCosts = (data != null) ? data.map(d => new FixedPrice(d)) : [];
                        break;
                    case 'budgets':
                        this.budgets = (data != null) ? data.map(d => new Budget(d)) : [];
                        break;
                    case 'months':
                        this.months = (data != null) ? data.map(d => new Month(d)) : [];
                        break;
                    case 'resources':
                        this.resources = (data != null) ? data.map(d => new Resource(d)) : [];
                        break;
                    default:
                        this[key] = data;
                }

            }
        }
    }
}





