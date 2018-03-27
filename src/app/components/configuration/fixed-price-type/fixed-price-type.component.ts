import { Component, OnInit } from '@angular/core';
import { FixedPriceTypeService } from './fixed-price-type.service';
import { FixedPriceType } from '../../../models';
import { Observable } from 'rxjs/Observable';

import '../../../rxjs-extensions';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-fixed-price-type',
  templateUrl: './fixed-price-type.component.html',
  styleUrls: ['./fixed-price-type.component.scss']
})
export class FixedPriceTypeComponent implements OnInit {

  items: FixedPriceType[];
  selectedItem: FixedPriceType;
  error: any;
  isLoading = false;
  selectedDelete: FixedPriceType;

  showDeleteConf = false;

  constructor(private itemService: FixedPriceTypeService,
    private toast: ToastrService) {
  }

  ngOnInit() {
    this.getList();
  }


  confirmDelete(status: FixedPriceType) {
    this.selectedDelete = status;
    this.showDeleteConf = true;
  }

  onDelete() {
    this.showDeleteConf = false;
    this.itemService.delete(this.selectedDelete.fixedPriceTypeId)
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
    this.selectedItem = new FixedPriceType();
  }

  edit(item: FixedPriceType) {
    this.selectedItem = item;
  }

  updateList(event: any) {
    this.getList();
  }
}
