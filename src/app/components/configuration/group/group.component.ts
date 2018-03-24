import { Component, OnInit } from '@angular/core';
import { GroupService } from './group.service';
import { Group, User, LoggedInUser } from '../../../models';
import { UserService } from '../../../services';

@Component({
  selector: 'app-project-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {

  groups: Group[];
  selectedGroup: Group;
  managers: LoggedInUser[];
  groupOptionsList: Group[];

  error: any;
  isLoading = false;

  constructor(private groupService: GroupService,
    private userService: UserService) {
  }

  ngOnInit() {

    this.getGroupList();
    this.getList();

  }




  onDelete(id: number) {
    if (confirm('Are you sure to delete this record?') === true) {
      // don't delete if there is a child or project assigned.
      ////////

      this.groupService.delete(id)
        .subscribe(x => {
          // this.snackBar.open('Phase has been deleted', '', { duration: 2000 });
          this.getGroupList();
          this.getList();
        },
          error => this.error = error);
    }
  }

  getList() {
    this.isLoading = true;
    this.groupService.getAll()
      .subscribe(results => {
        const groups = results;

        for (const group of groups) {

          // get the parent group name if available.
          if (group.parentId !== 0 || group.parentId !== null) {
            for (const parent of groups) {
              if (parent.groupId = group.parentId) {
                group.parentName = parent.groupName;
              }
            }
          }
        }
        // pass the groups back to the for and  
        this.groups = groups;
        this.selectedGroup = undefined;


        // call the pm list and add the group manager name.
        this.userService.getUserInRoles('editPrograms').subscribe(
          res => {
            this.managers = res;
            for (const group of this.groups) {
              for (const user of this.managers) {
                if (user.currentUser.userId === group.groupManager) {
                  group.groupManagerName = user.currentUser.firstName + ' ' +
                    user.currentUser.lastName;
                }
              }
            }
            this.isLoading = false;

          },
          error => this.error = error);
        // get the group manager name.


      },
      error => this.error = error);
  }

getGroupList() {
  this.groupService.getOptionList().subscribe(
    results => {
    this.groupOptionsList = results;
    },
    error => this.error = error);
}




add() {
  this.selectedGroup = new Group();
}

edit(group: Group) {
  this.selectedGroup = group;
}

updateList(event: any) {
  this.getGroupList();
  this.getList();
}

}
