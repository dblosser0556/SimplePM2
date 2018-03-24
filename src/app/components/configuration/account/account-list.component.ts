import { Component, OnInit } from '@angular/core';

import { UserService} from '../../../services';
import { LoggedInUser, User, UserRole } from '../../../models';



@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss']
})


export class AccountListComponent implements OnInit {

    users: LoggedInUser[];
    selectedUser: LoggedInUser;
    roleList: string[];
    error: any;
    isLoading = false;

    constructor(private userService: UserService) {
    }

    ngOnInit() {
        this.getList();
        this.getRoles();
    }




   /*  onDelete(id: number) {
        if (confirm('Are you sure to delete this record?') === true) {
            this.userService.delete(id)
                .subscribe(x => {
                  //  this.snackBar.open('User has been deleted', '', {duration: 2000});
                    this.getList();
                });
        }
    } */

    getList() {
        this.isLoading = true;
        this.userService.getAll()
            .subscribe(results => {
                this.users = results;
                this.isLoading = false;
            },
            error => this.error);
        this.selectedUser = undefined;
    }

    getRoles() {
        this.userService.getRoles().subscribe( result => { this.roleList = result; },
        errors => this.error);
    }

    add() {
        const user = new LoggedInUser();

        // add all the standard roles to the user
        this.roleList.forEach(role => {
            const _userRole = new UserRole();
            _userRole.roleName = role;
            _userRole.selected = false;
            user.roles.push(_userRole);
        });
        this.selectedUser = user;
    }

    edit(user: LoggedInUser) {

     this.selectedUser = user;


    }

    updateList(event: any) {
        this.getList();
    }
}
