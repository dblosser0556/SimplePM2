import { Component, OnInit } from '@angular/core';
import { StatusService } from './status.service';
import { Status } from '../../../models';
import { Observable } from 'rxjs/Observable';

import '../../../rxjs-extensions';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

   items: Status[];
  selectedItem: Status;
  error: any;
  isLoading = false;

  constructor(private itemService: StatusService) {
  }

  ngOnInit() {
    this.getList();
  }




  onDelete(id: number) {
    if (confirm('Are you sure to delete this record?') === true) {
      this.itemService.delete(id)
        .subscribe(x => {
          //  this.snackBar.open('Phase has been deleted', '', { duration: 2000 });
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
    this.selectedItem = new Status();
  }

  edit(item: Status) {
    this.selectedItem = item;
  }

  updateList(event: any) {
    this.getList();
  }
}
