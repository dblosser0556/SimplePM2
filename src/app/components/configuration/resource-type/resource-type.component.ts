
import { Component, OnInit } from '@angular/core';
import { ResourceTypeService } from '../../../services';
import { ResourceType } from '../../../models';

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
      error =>  {
        this.toast.error(error);
        console.log(error);
      });
    this.selectedItem = undefined;
  }

  add() {
    this.selectedItem = new ResourceType();
  }

  edit(item: ResourceType) {
    this.selectedItem = item;
  }

  updateList(event: any) {
      this.getList();
  }
}

