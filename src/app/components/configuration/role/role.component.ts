import { Component, OnInit } from '@angular/core';
import { RoleService } from './role.service';
import { Role } from '../../../models';

import '../../../rxjs-extensions';
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

  constructor(private itemService: RoleService) {
  }

  ngOnInit() {
    this.getList();
  }




  onDelete(id: number) {
    if (confirm('Are you sure to delete this record?') === true) {
      this.itemService.delete(id)
        .subscribe(x => {
           // this.snackBar.open('Phase has been deleted', '', { duration: 2000 });
          this.getList();
        },
        error =>  this.error = error);
    }
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
