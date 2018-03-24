import { Component, OnInit } from '@angular/core';
import { FixedPriceTypeService } from './fixed-price-type.service';
import { FixedPriceType } from '../../../models';
import { Observable } from 'rxjs/Observable';

import '../../../rxjs-extensions';

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


  constructor(private itemService: FixedPriceTypeService) {
  }

  ngOnInit() {
    this.getList();
  }




  onDelete(id: number) {
    if (confirm('Are you sure to delete this record?') === true) {
      this.itemService.delete(id)
        .subscribe(x => {
         // this.snackBar.open('Phase has been deleted', '', { duration: 2000 });
         // this.getList();
        },
        error => this.error = error);
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
    this.selectedItem = new FixedPriceType();
  }

  edit(item: FixedPriceType) {
    this.selectedItem = item;
  }

  updateList(event: any) {
    this.getList();
  }
}
