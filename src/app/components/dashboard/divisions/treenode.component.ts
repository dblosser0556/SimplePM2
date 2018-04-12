import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { GroupTreeView } from '../../../models';


@Component({
    selector: 'app-tree-node',
    template: `
        <ng-container>
            <clr-tree-node (change)="applyFilters()" *ngFor="let group of groups"  [(clrSelected)]="group.selected">
                {{group.groupName}}
                <ng-template *ngIf="group.hasChildren" clrIfExpanded>
                    <app-tree-node [parentId]="group.groupId" [groups]="group.groups" (applyFilter)="applyFilters($event)"></app-tree-node>
                </ng-template>
            </clr-tree-node>
        </ng-container>
    `
})
export class TreeNodeComponent implements OnInit {
    @Input() groups: GroupTreeView[];
    @Input() parentId: number;
    @Output() applyFilter = new EventEmitter();



    ngOnInit() {
 
    }

    applyFilters() {
        this.applyFilter.emit();
    }
}
