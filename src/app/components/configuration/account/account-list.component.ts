import { Component, OnInit } from '@angular/core';

import { UserService } from '../../../services';
import { LoggedInUser, User, UserRole } from '../../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';



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
    showDeleteConf = false;

    constructor(private userService: UserService,
        private router: Router,
        private route: ActivatedRoute,
        private toast: ToastrService) {
    }

    ngOnInit() {
        this.getList();
        this.getRoles();
    }


    confirmDelete(user: LoggedInUser) {
        this.selectedUser = user;
        this.showDeleteConf = true;
    }

    onDelete() {
        this.showDeleteConf = false;
        this.userService.delete(this.selectedUser.currentUser.userName)
            .subscribe(x => {
                this.toast.success('User Deleted');
                this.getList();
            },
            error => this.toast.error(error, 'Oops'));
    }

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
        this.userService.getRoles().subscribe(result => { this.roleList = result; },
            errors => this.error);
    }

    add() {
        this.router.navigate(['./register'], { queryParams: { userId: -1 }, relativeTo: this.route });
    }

    edit(user: LoggedInUser) {
        this.router.navigate(['./register'], { queryParams: { userId: user.currentUser.userName }, relativeTo: this.route });
    }


    updateList(event: any) {
        this.getList();
    }
}
