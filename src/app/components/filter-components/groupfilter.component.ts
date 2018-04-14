import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { GroupTreeView, Group, FilterByKey, ProjectsByFilterKey } from '../../models';
import { GroupService } from '../configuration/group/group.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


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
            <clr-checkbox (change)="applyFilters(group)" [clrDisabled]="group.disabled" [(clrChecked)]="group.selected">
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
    styleUrls: ['./filter.component.scss']
})
export class GroupFilterComponent implements OnInit {

    private _projectsByGroup = new BehaviorSubject<ProjectsByFilterKey[]>([]);
    @Input() set projectsByGroup(value: ProjectsByFilterKey[]) {
        this._projectsByGroup.next(value);
    }

    get projectsByGroup() {
        return this._projectsByGroup.getValue();
    }

    @Output() changeGroupFilter = new EventEmitter<FilterByKey[]>();

    groups: Group[];
    rootGroups: GroupTreeView[] = [];
    allProjectsByGroup: ProjectsByFilterKey[] = [];
    firstPass = true;

    constructor(
        private groupService: GroupService) { }

    ngOnInit() {

        // The monthlyProjections data is provided asyncronously by
        // the parent component.  The data is not available on init.
        // So we need to subscribe to changes to the data
        this._projectsByGroup.subscribe(x => {


            // if this is the first time through create the hierarchy,
            // else just make updates.
            if (this.firstPass) {
                this.allProjectsByGroup = this.projectsByGroup;
                this.getGroups();
                if (this.projectsByGroup.length > 0) {
                    this.firstPass = false;
                }
            } else {
                this.updateGroupProjectCount(this.rootGroups);
            }
        });
    }

    applyFilters(tvGroup: GroupTreeView) {
        // make sure the check marks are consistent
        // between the parent and the children.

        // if selected then mark all the children selected.
        if (tvGroup.selected && tvGroup.hasChildren) {
            this.updateSelected(tvGroup.groups, true);
        }
        // See if we can select the parent by making sure all of his
        // children are selected.
        if (tvGroup.selected && tvGroup.parentId !== 0) {
            this.checkParent(tvGroup.parentId);
        }

        // if a child is not selected then all of his
        // parents and grandchildren must be unselected.
        if (!tvGroup.selected && tvGroup.hasChildren) {
            this.updateSelected(tvGroup.groups, false);
        }

        if (!tvGroup.selected && tvGroup.parentId !== 0) {
            this.unselectParent(tvGroup.parentId);
        }
        const groupFilters = this.convertToFilterByKey(this.rootGroups);
        console.log('group componentfilter fired');
        this.changeGroupFilter.emit(groupFilters);
    }

    // This updates all of the pass group.
    // Make recursive call to ensure all children are handled
    updateSelected(tvGroups: GroupTreeView[], selected: boolean) {
        for (const tvGroup of tvGroups) {
            // Make sure not disabled.
            if (!tvGroup.disabled) {
                tvGroup.selected = selected;
                if (tvGroup.hasChildren) {
                    this.updateSelected(tvGroup.groups, selected);
                }
            }
        }
    }

    // If a child is unselected then all of his parents must be unselected
    // as well.
    unselectParent(groupId: number) {
        // find the group from the groupId
        const tvGroup = this.findTvGroup(groupId);
        tvGroup.selected = false;
        if (tvGroup.parentId !== 0) {
            this.unselectParent(tvGroup.parentId);
        }
    }

    // This check to see if all of the groups siblings are checked
    // if so then it can be check as well.
    checkParent(groupId: number) {
        const tvGroupParent = this.findTvGroup(groupId);
        let canSelect = true;
        for (const tvGroup of tvGroupParent.groups) {
            if (!tvGroup.selected  && !tvGroup.disabled) {
                canSelect = false;
            }
        }
        // if we can select then we update this parent as
        // selected and check parents.
        if (canSelect) {
            tvGroupParent.selected = true;
            if (tvGroupParent.parentId !== 0) {
                this.checkParent(tvGroupParent.parentId);
            }
        }
    }


    findTvGroup(groupId: number): GroupTreeView {
        let foundGroup;
        // Go through the parent groups and all of thier children until found.
        for (const tvGroup of this.rootGroups) {
            if (tvGroup.groupId === groupId) {
                foundGroup = tvGroup;
                return foundGroup;
            } else {
                foundGroup = this.findTvGroupInChildren(groupId, tvGroup.groups);
                if (foundGroup !== undefined) {
                    return foundGroup;
                }
            }
        }
    }

    findTvGroupInChildren(groupId: number, tvGroups: GroupTreeView[]): GroupTreeView {
        let foundGroup;
        for (const tvGroup of tvGroups) {
            if (tvGroup.groupId === groupId) {
                return tvGroup;
            }

            if (tvGroup.hasChildren) {
                foundGroup = this.findTvGroupInChildren(groupId, tvGroup.groups);
                if (foundGroup !== undefined) {
                    return foundGroup;
                }
            }

        }
        return foundGroup;
    }

    // get all the groups and put them in a hierarchy.
    // the top groups have a parent of 0
    getGroups() {
        this.rootGroups = [];

        this.groupService.getAll().subscribe(results => {
            this.groups = results;

            // build the group hierarcy from the returned group.
            // start this all the groups that have no parent.
            for (const group of this.groups.filter(g => g.parentId === 0)) {

                const projectCount = this.getProjectGroups(group, this.allProjectsByGroup);

                const newGroupTreeView = {
                    groupName: group.groupName,
                    groupId: group.groupId,
                    parentId: 0,
                    level: group.level,
                    hasChildren: this.hasChildren(group.groupId),
                    displayChildren: false,
                    groups: this.getChildren(group.groupId),
                    selected: (projectCount > 0) ? true : false,
                    disabled: (projectCount <= 0) ? true : false,
                    filteredProjects: projectCount,
                    unfilteredProjects: projectCount
                };
                this.rootGroups.push(newGroupTreeView);
            }
        });
    }

    // This creates a child tree view element for each child of the calling
    // group.
    getChildren(groupId: number): GroupTreeView[] {
        const treeviewGroups: GroupTreeView[] = [];

        for (const group of this.groups.filter(g => g.parentId === groupId)) {

            const projectCount = this.getProjectGroups(group, this.allProjectsByGroup);

            const newGroupTreeView = {
                groupName: group.groupName,
                groupId: group.groupId,
                parentId: group.parentId,
                level: group.level,
                hasChildren: this.hasChildren(group.groupId),
                displayChildren: false,
                groups: this.getChildren(group.groupId),
                selected: (projectCount > 0) ? true : false,
                disabled: (projectCount <= 0) ? true : false,
                filteredProjects: projectCount,
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



    // This routine is call to calculate the number of projects for each group
    getProjectGroups(group: Group, projectGroups: ProjectsByFilterKey[]): number {
        const filterGroups = this.groups.filter(g => g.lft >= group.lft && g.rgt <= group.rgt);

        // get the list of projects by group
        // first sort the list the project and group
        let projectCount = 0;
        for (const filtergroup of filterGroups) {
            for (const projectGroup of projectGroups) {
                if (projectGroup.keyValue === filtergroup.groupName) {
                    projectCount++;
                }
            }
        }

        return projectCount;
    }

    // update the count of the projects based on the new filtered list.
    updateGroupProjectCount(tvgroups: GroupTreeView[]) {
        for (const tvgroup of tvgroups) {
            const index = this.groups.findIndex(g => g.groupName === tvgroup.groupName);
            tvgroup.filteredProjects = this.getProjectGroups(this.groups[index], this.projectsByGroup);
            if (tvgroup.hasChildren) {
                this.updateGroupProjectCount(tvgroup.groups);
            }
        }
    }

    // resurse through this routine to convert the hierach to
    // simple filter array.
    convertToFilterByKey(tvGroups: GroupTreeView[]): FilterByKey[] {
        let filterByKeys: FilterByKey[] = [];

        // go through each of the parents that aren't disabled
        for (const tvGroup of tvGroups.filter(t => !t.disabled)) {
            if (tvGroup.selected) {
                const filterByKey: FilterByKey = {
                    keyValue: tvGroup.groupName,
                    selected: true,
                    disabled: false,
                    unfilteredCount: 0,
                    filteredCount: 0,
                };
                filterByKeys.push(filterByKey);
            }
            if (tvGroup.hasChildren) {
                const cfilterByKeys = this.convertToFilterByKey(tvGroup.groups);
                filterByKeys = filterByKeys.concat(cfilterByKeys);
            }
        }
        return filterByKeys;
    }



}
