
import { Component, OnInit } from '@angular/core';
import { ResourceTypeService } from './resource-type.service';
import { ResourceType } from '../../../models';
import { Observable } from 'rxjs/Observable';

import '../../../rxjs-extensions';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-resource-type',
  templateUrl: './resource-type.component.html',
  styleUrls: ['./resource-type.component.scss']
})
export class ResourceTypeComponent implements OnInit {

  items: ResourceType[];
  selectedItem: ResourceType;
  error: any;
  successMessage: string;
  isLoading = false;
  selectedDelete: ResourceType;
  showDeleteConf = false;

  constructor(private itemService: ResourceTypeService,
    private toast: ToastrService) {
  }

  ngOnInit() {
    this.getList();
  }


  confirmDelete(status: ResourceType) {
    this.selectedDelete = status;
    this.showDeleteConf = true;
  }

  onDelete() {
    this.showDeleteConf = false;
    this.itemService.delete(this.selectedDelete.resourceTypeId)
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
    this.selectedItem = new ResourceType();
  }

  edit(item: ResourceType) {
    this.selectedItem = item;
  }

  updateList(event: any) {
    if (event != null) {
      this.successMessage = event;
      this.getList();
    }
  }
}

