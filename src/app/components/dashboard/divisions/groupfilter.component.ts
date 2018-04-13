import { Component, Input, OnInit, AfterContentInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { GroupTreeView, ProjectMonthlyProjection, Group } from '../../../models';
import { GroupService } from '../../configuration/group/group.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface ProjectGroups {
    groupName: string;
    projectName: string;
}
@Component({
    selector: 'app-group-filter',
    template: `
    <ng-container *ngFor="let group of rootGroups">
        <div class="filter-row">
            <div *ngIf="group.hasChildren  && !group.displayChildren">
                <clr-icon shape="angle" dir="right"size="16"(click)="group.displayChildren=!group.displayChildren"></clr-icon>
            </div>
            <div *ngIf="group.hasChildren && group.displayChildren">
                <clr-icon shape="angle" dir="down"size="16"(click)="group.displayChildren=!group.displayChildren"></clr-icon>
            </div>
            <div *ngIf="!group.hasChildren" style="width: 16px;">
            </div>
            <clr-checkbox (change)="applyFilters(group)" [(clrChecked)]="group.selected">
                <label class="filter-label">{{group.groupName}}</label>
            </clr-checkbox>
            <span class="badge badge-orange">{{group.filteredProjects}}</span>
            <span class="badge">{{group.unfilteredProjects}}</span>
        </div>
        <ng-container *ngIf="group.hasChildren && group.displayChildren">
            <app-tree-node [parentId]="group.groupId" [groups]="group.groups"
                (applyFilter)="applyFilters($event)"></app-tree-node>
        </ng-container>
    </ng-container>
    `,
    styleUrls: ['./divisions.component.scss']
})
export class GroupFilterComponent implements OnInit, AfterContentInit, AfterViewInit {

    private _monthlyProjections = new BehaviorSubject<ProjectMonthlyProjection[]>([]);
    @Input() set monthlyProjections (value: ProjectMonthlyProjection[]) {
        this._monthlyProjections.next(value);
    }

    get monthlyProjections() {
        return this._monthlyProjections.getValue();
    }
    @Output() applyGroupFilters = new EventEmitter<GroupTreeView[]>();

    groups: Group[];
    treeviewGroups: GroupTreeView[] = [];
    rootGroups: GroupTreeView[];
    allProjectGroups: ProjectGroups[] = [];
    curProjectGroups: ProjectGroups[] = [];
    firstPass = false;

    constructor(
        private groupService: GroupService) { }

    ngOnInit() {
        this._monthlyProjections.subscribe(x => {
            this.setGroupProjects();
            if (this.firstPass) {
                this.getGroups();
            } else {
                this.updateGroups();
            }
            
        });
        this.firstPass = true;
    }
    ngAfterContentInit() {
        // this.getGroups();
    }

    ngAfterViewInit() {
       //  this.getGroups();
    }
    applyGroupFilter(event: any) {
        this.applyGroupFilters.emit();
    }


    // get all the groups and put them in a hierarchy.
    // the tp[] groups have a parent of 0
    getGroups() {
        this.treeviewGroups = [];

        this.groupService.getAll().subscribe(results => {
            this.groups = results;

            // build the group hierarcy from the returned group.
            // start this all the groups that have no parent.
            for (const group of this.groups.filter(g => g.parentId === 0)) {

                const projectCount = this.getProjects(group, this.allProjectGroups);
                const filterprojectCount = this.getProjects(group, this.curProjectGroups);

                const newGroupTreeView = {
                    groupName: group.groupName,
                    groupId: group.groupId,
                    parentId: 0,
                    level: group.level,
                    hasChildren: this.hasChildren(group.groupId),
                    displayChildren: false,
                    groups: this.getChildren(group.groupId),
                    selected: true,
                    disabled: false,
                    filteredProjects: filterprojectCount,
                    unfilteredProjects: projectCount
                };
                this.treeviewGroups.push(newGroupTreeView);
            }
            // for display the root groups are at the top of the treeView.
            this.rootGroups = this.treeviewGroups.filter(t => t.parentId === 0);

        });
    }

    getChildren(groupId: number): GroupTreeView[] {
        const treeviewGroups: GroupTreeView[] = [];

        for (const group of this.groups.filter(g => g.parentId === groupId)) {

            const projectCount = this.getProjects(group, this.allProjectGroups);
            const filterprojectCount = this.getProjects(group, this.curProjectGroups);

            const newGroupTreeView = {
                groupName: group.groupName,
                groupId: group.groupId,
                parentId: group.parentId,
                level: group.level,
                hasChildren: this.hasChildren(group.groupId),
                displayChildren: false,
                groups: this.getChildren(group.groupId),
                selected: true,
                disabled: false,
                filteredProjects: filterprojectCount,
                unfilteredProjects: projectCount
            };
            treeviewGroups.push(newGroupTreeView);
        }
        return treeviewGroups;
    }

    hasChildren(groupId: number): boolean {
        for (const group of this.groups) {
            if (group.parentId === groupId) {
                return true;
            }
        }
        return false;
    }

    setGroupProjects() {

        this.curProjectGroups = [];
        let  sortedMonthlyProjects = this.monthlyProjections;
        sortedMonthlyProjects =  _.chain(sortedMonthlyProjects).sortBy('projectName')
            .sortBy('groupName').value();

        let curProject = '';
        for (const project of sortedMonthlyProjects) {
            if (project.projectName !== curProject) {
                const projectGroup = {
                    groupName: project.groupName,
                    projectName: project.projectName
                };
                this.curProjectGroups.push(projectGroup);
                curProject = project.projectName;
            }
        }

        // store off the project groups for counting after filtering.
        if (this.firstPass) {
            this.firstPass = false;
            this.allProjectGroups = this.curProjectGroups;
        }
    }
    getProjects(group: Group,  projectGroups: ProjectGroups[]): number {
        const filterGroups = this.groups.filter(g => g.lft >= group.lft && g.rgt <= group.rgt);

        // get the list of projects by group
        // first sort the list the project and group
        let projectCount = 0;
        for (const filtergroup of filterGroups) {
            for (const projectGroup of projectGroups) {
                if (projectGroup.groupName === filtergroup.groupName) {
                    projectCount++;
                }
            }
        }

        return projectCount;
    }

    updateGroups() {
        for (const group of this.treeviewGroups ) {
            const index = this.groups.findIndex(g => g.groupName === group.groupName);
            if (index >= 0) {
                group.filteredProjects = this.getProjects(this.groups[index], this.curProjectGroups);
            }
        }
    }

}
