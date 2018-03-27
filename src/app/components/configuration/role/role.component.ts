import { Component, OnInit } from '@angular/core';
import { RoleService } from './role.service';
import { Role } from '../../../models';

import '../../../rxjs-extensions';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {

  items: Role[];
  selectedItem: Role;
  error: any;
  isLoading = false;
  selectedDelete: Role;
  showDeleteConf = false;

  constructor(private itemService: RoleService,
    private toast: ToastrService) {
  }

  ngOnInit() {
    this.getList();
  }


  confirmDelete(status: Role) {
    this.selectedDelete = status;
    this.showDeleteConf = true;
  }

  onDelete() {
    this.showDeleteConf = false;
    this.itemService.delete(this.selectedDelete.roleId)
      .subscribe(x => {
        this.toast.success('Role has been deleted', 'Success');
        this.getList();
      },
        error => {
          this.toast.error(error);
          console.log(error);
        });
  }

  getList() {
    this.isLoading = true;
    this.itemService.getAll()
      .subscribe(results => {
        this.items = results;
        this.isLoading = false;
      },
      error => this.error = error);
    this.selectedItem = undefined;
  }

  add() {
    this.selectedItem = new Role();
  }

  edit(item: Role) {
    this.selectedItem = item;
  }

  updateList(event: any) {
    this.getList();
  }
}
