import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { GroupTreeView } from '../../../models';


@Component({
    selector: 'app-tree-node',
    template: `
    <ng-container *ngFor="let group of groups">
        <div class="filter-row"
            [ngStyle]="{'margin-left':getMargin(group.level)}">
            <div *ngIf="group.hasChildren  && !group.displayChildren">
                <clr-icon shape="angle" dir="right"size="16"(click)="group.displayChildren=!group.displayChildren"></clr-icon>
            </div>
            <div *ngIf="group.hasChildren && group.displayChildren">
                <clr-icon shape="angle" dir="down"size="16"(click)="group.displayChildren=!group.displayChildren"></clr-icon>
            </div>
            <div *ngIf="!group.hasChildren" style="width: 16px;">
            </div>
            <clr-checkbox (change)="applyFilters(group)" [clrDisabled]="group.disabled"  [(clrChecked)]="group.selected">
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
export class TreeNodeComponent implements OnInit {
    @Input() groups: GroupTreeView[];
    @Input() parentId: number;
    @Output() applyFilter = new EventEmitter<GroupTreeView>();



    ngOnInit() {
    }

    applyFilters(event: any) {
        console.log ('TreeNode apply filters fired', event);
        this.applyFilter.emit(event);

    }

    getMargin(level: number) {
        const indent = (level - 1) * 16;
        return indent.toString() + 'px';
    }
}
