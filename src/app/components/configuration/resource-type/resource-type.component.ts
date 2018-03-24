
import { Component, OnInit } from '@angular/core';
import { ResourceTypeService } from './resource-type.service';
import { ResourceType } from '../../../models';
import { Observable } from 'rxjs/Observable';

import '../../../rxjs-extensions';


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

  constructor(private itemService: ResourceTypeService) {
  }

  ngOnInit() {
    this.getList();
  }




  onDelete(id: number) {
    if (confirm('Are you sure to delete this record?') === true) {
      this.itemService.delete(id)
        .subscribe(x => {
          this.successMessage = 'Resource type has been deleted';
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

