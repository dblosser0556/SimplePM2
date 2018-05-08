import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../../services';
import { Group, User, LoggedInUser } from '../../../models';
import { UserService } from '../../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-project-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {

  groups: Group[];
  selectedGroup: Group;
  managers: LoggedInUser[];

  error: any;
  isLoading = false;
  showDeleteConf = false;


  constructor(private groupService: GroupService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastrService) {
  }

  ngOnInit() {


    this.getList();

  }


  confirmDelete(group: Group) {
    this.selectedGroup = group;
    this.showDeleteConf = true;
  }

  onDelete() {
    this.showDeleteConf = false;
    this.groupService.delete(this.selectedGroup.groupId)
      .subscribe(x => {
        this.toast.success('Group Deleted');
        this.getList();
      },
        error => this.toast.error(error, 'Oops'));

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
              if (parent.groupId === group.parentId) {
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





  add() {
    this.router.navigate(['./details'], { queryParams: { groupId: -1 }, relativeTo: this.route });
  }

  edit(group: Group) {
    this.router.navigate(['./details'], { queryParams: { groupId: group.groupId }, relativeTo: this.route });
  }

}
