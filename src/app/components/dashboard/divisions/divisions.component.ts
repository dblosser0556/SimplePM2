import { Component, OnInit, OnChanges } from '@angular/core';
import { StatusService } from '../../configuration/status/status.service';
import { GroupService } from '../../configuration/group/group.service';
import { Status, Group, GroupTreeView } from '../../../models';


@Component({
  selector: 'app-divisions',
  templateUrl: './divisions.component.html',
  styleUrls: ['./divisions.component.scss']
})
export class DivisionsComponent implements OnInit, OnChanges {
  isLoading = false;
  status: Status[];
  groups: Group[];
  treeviewGroups: GroupTreeView[] = [];
  rootGroups: GroupTreeView[] = [];

  constructor(private statusService: StatusService, private groupService: GroupService) { }

  ngOnInit() {
    this.isLoading = true;
    this.getStatus();
    this.getGroups(0);
  }

  ngOnChanges() {
    console.log(this.treeviewGroups);
  }
  getStatus() {
    this.statusService.getAll().subscribe(results => {
      this.status = results;
    }
    );
  }

  getGroups(parent: 0) {
    this.groupService.getAll().subscribe(results => {
      this.groups = results;
      for (const group of this.groups.filter(g => g.parentId === 0)) {
        const newGroupTreeView = {
          groupName: group.groupName,
          groupId: group.groupId,
          parentId: 0,
          hasChildren: this.hasChildren(group.groupId),
          groups: this.getChildren(group.groupId),
          selected: true
        };
        this.treeviewGroups.push(newGroupTreeView);
      }
      this.rootGroups = this.treeviewGroups.filter(t =>  t.parentId === 0);
    });
  }

  getChildren(groupId: number): GroupTreeView[] {
    const treeviewGroups: GroupTreeView[] = [];

    for (const group of this.groups.filter(g => g.parentId === groupId)) {
      const newGroupTreeView = {
        groupName: group.groupName,
        groupId: group.groupId,
        parentId: group.parentId,
        hasChildren: this.hasChildren(group.groupId),
        groups: this.getChildren(group.groupId),
        selected: true
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

  applyFilter() {
    console.log(this.treeviewGroups);
  }


}
