import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ProjectsByFilterKey, FilterByKey } from '../../models';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';



@Component({
    selector: 'app-year-filter',
    template: `
    <ng-container *ngFor="let year  of years">
        <div class="filter-row">
            <clr-checkbox (change)="applyYearFilter(year)" [clrDisabled]="year.disabled" [(clrChecked)]="year.selected">
                <label class="filter-label">{{year.keyValue}}</label>
            </clr-checkbox>
            <span class="badge badge-orange filter-badge">{{year.filteredCount}}</span>
            <span class="badge filter-badge">{{year.unfilteredCount}}</span>
        </div>
    </ng-container>
    `,
    styleUrls: ['./filter.component.scss']
})
export class YearFilterComponent implements OnInit {

    private _projectsByYear = new BehaviorSubject<ProjectsByFilterKey[]>([]);
    @Input() set projectsByYear(value: ProjectsByFilterKey[]) {
        this._projectsByYear.next(value);
    }

    get projectsByYear() {
        return this._projectsByYear.getValue();
    }

    @Output() changeYearFilter = new EventEmitter<FilterByKey[]>();

    years: FilterByKey[] = [];
    firstPass = true;
    allProjectsByYear: ProjectsByFilterKey[];
    constructor() { }

    ngOnInit() {

        // The monthlyProjections data is provided asyncronously by
        // the parent component.  The data is not available on init.
        // So we need to subscribe to changes to the data
        this._projectsByYear.subscribe(x => {

            // if this is the first time through create the hierarchy,
            // else just make updates.
            if (this.firstPass) {
                if (x.length > 0) {
                    this.allProjectsByYear = x;
                    this.years = this.setupYearsFilter(this.projectsByYear);
                    this.firstPass = false;
                }
            } else {
                this.updateYearsFilter(this.projectsByYear);
            }
        });
    }



    // update the selected values of this years filter
    // other filters may have filtered out
    updateYearsFilter(projectsByYear: ProjectsByFilterKey[]) {
        for (const year of this.years) {
            year.filteredCount = this.getProjectsByYear(year.keyValue, projectsByYear);

            if (year.filteredCount === 0) {
                year.selected = false;
            } else {
                year.selected = true;
            }
        }
    }




    applyYearFilter(event: any) {
        console.log('Year Filter Fired');
        this.changeYearFilter.emit(this.years);
    }

    // figure out the available years
    setupYearsFilter(projectsByYear: ProjectsByFilterKey[]): FilterByKey[] {
        const years = new Array<FilterByKey>();
        let projectCount = 0;
        let curYear = projectsByYear[0].keyValue;
        for (const project of projectsByYear) {

            if (curYear !== project.keyValue) {
                const year = {
                    keyValue: curYear,
                    selected: true,
                    disabled: false,
                    unfilteredCount: projectCount,
                    filteredCount: projectCount
                };
                years.push(year);
                curYear = project.keyValue;
                projectCount = 1;
            }
            projectCount++;
        }
        // handle the last year.
        const lastYear = {
            keyValue: curYear,
            selected: true,
            disabled: false,
            unfilteredCount: projectCount,
            filteredCount: projectCount
        };
        years.push(lastYear);


        return years;
    }

    // This routine is called to calculate the number of projects for each year
    getProjectsByYear(year: string, projectsByYear: ProjectsByFilterKey[]): number {
        // get the list of projects by group
        // first sort the list the project and group
        let projectCount = 0;
        for (const projectByYear of projectsByYear) {
            if (projectByYear.keyValue === year) {
                projectCount++;
            }
        }
        return projectCount;
    }
}
