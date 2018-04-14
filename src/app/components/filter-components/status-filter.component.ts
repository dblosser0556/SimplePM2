import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FilterByKey, ProjectsByFilterKey, Status } from '../../models';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { StatusService } from '../configuration/status/status.service';
import { ToastrService } from 'ngx-toastr';



@Component({
    selector: 'app-status-filter',
    template: `
    <ng-container *ngFor="let stat of status">
        <div class="filter-row">
            <clr-checkbox (change)="applyStatusFilter(stat)" [clrDisabled]="stat.disabled" [(clrChecked)]="stat.selected">
            <label class="filter-label">{{stat.keyValue}}</label>
            </clr-checkbox>
            <span class="badge badge-orange filter-badge">{{stat.filteredCount}}</span>
            <span class="badge filter-badge">{{stat.unfilteredCount}}</span>
        </div>
    </ng-container>
    `,
    styleUrls: ['./filter.component.scss']
})
export class StatusFilterComponent implements OnInit {

    private _projectsByStatus = new BehaviorSubject<ProjectsByFilterKey[]>([]);
    @Input() set projectsByStatus(value: ProjectsByFilterKey[]) {
        this._projectsByStatus.next(value);
    }

    get projectsByStatus() {
        return this._projectsByStatus.getValue();
    }

    @Output() changeStatusFilter = new EventEmitter<FilterByKey[]>();


    firstPass = true;
    status: FilterByKey[] = [];
    allProjectsByStatus: ProjectsByFilterKey[];

    constructor(private statusService: StatusService,
        private toast: ToastrService) { }

    ngOnInit() {

        // The monthlyProjections data is provided asyncronously by
        // the parent component.  The data is not available on init.
        // So we need to subscribe to changes to the data
        this._projectsByStatus.subscribe(x => {

            // if this is the first time through create the hierarchy,
            // else just make updates.
            if (this.firstPass) {
                if (x.length > 0) {
                    this.allProjectsByStatus = x;
                    this.getStatus();
                    this.firstPass = false;
                }
            } else {
                this.updateStatusFilter(this.projectsByStatus);
            }
        });
    }

    getStatus() {
        this.statusService.getAll().subscribe(results => {
            const projectStatus: Status[] = results;
            this.status = [];
            // status is the superlist so go through each
            // and compare to the ones in the list of projects.
            projectStatus.forEach(s => {
                const projectCount = this.getProjectsByStatus(s.statusName, this.projectsByStatus);

                const newStatus = {
                    keyValue: s.statusName,
                    selected: (projectCount > 0) ? true : false,
                    disabled: (projectCount === 0) ? true : false,
                    filteredCount: projectCount,
                    unfilteredCount: projectCount
                };
                this.status.push(newStatus);
            });
        }, error => {
            this.toast.error('error', 'Oops - Retrieving Status');
            console.log('Retrieving - Status', error);
        });
    }

    applyStatusFilter(event: any) {
        console.log('Status Filter fired');
        this.changeStatusFilter.emit(this.status);
    }


    // update the selected and the counts of the status filter
    // other filters may have filtered out
    updateStatusFilter(projectsByStatus: ProjectsByFilterKey[]) {
        for (const stat of this.status) {
            stat.filteredCount = this.getProjectsByStatus(stat.keyValue, projectsByStatus);

            if (stat.filteredCount === 0) {
                stat.selected = false;
            } else {
                stat.selected = true;
            }
        }
    }


    // This routine is called to calculate the number of projects for each year
    getProjectsByStatus(status: string, projectsByStatus: ProjectsByFilterKey[]): number {
        // get the list of projects by group
        // first sort the list the project and group
        let projectCount = 0;
        for (const project of projectsByStatus) {
            if (project.keyValue === status) {
                projectCount++;
            }
        }
        return projectCount;
    }
}
