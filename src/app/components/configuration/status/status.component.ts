import { Component, OnInit } from '@angular/core';
import { StatusService } from './status.service';
import { Status } from '../../../models';
import { Observable } from 'rxjs/Observable';

import '../../../rxjs-extensions';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  items: Status[];
  selectedItem: Status;
  selectedDelete: Status;
  error: any;
  showDeleteConf = false;
  isLoading = false;

  constructor(private itemService: StatusService,
    private toast: ToastrService) {
  }

  ngOnInit() {
    this.getList();
  }


  confirmDelete(status: Status) {
    this.selectedDelete = status;
    this.showDeleteConf = true;
  }

  onDelete() {
    this.showDeleteConf = false;
    this.itemService.delete(this.selectedDelete.statusId)
      .subscribe(x => {
        this.toast.success('Status has been deleted', 'Success');
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
    this.selectedItem = new Status();
  }

  edit(item: Status) {
    this.selectedItem = item;
  }

  updateList(event: any) {
    this.getList();
  }
}
