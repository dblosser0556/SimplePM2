import { Component, OnInit, Input, OnChanges, Output, EventEmitter  } from '@angular/core';


import { FixedPriceTypeService } from './../fixed-price-type.service';
import { FixedPriceType } from '../../../../models';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

interface CreateProjectCostType {
  fixedPriceTypeName: string;
  fixedPriceTypeDesc: string;
}


@Component({
  selector: 'app-fixed-price-type-detail',
  templateUrl: './fixed-price-type-detail.component.html',
  styleUrls: ['./fixed-price-type-detail.component.scss']
})
export class FixedPriceTypeDetailComponent implements OnInit, OnChanges {

  @Input() item: FixedPriceType;
  @Output() itemChange = new EventEmitter<FixedPriceType>();

  itemForm: FormGroup;
  error: any;

  constructor(private itemService: FixedPriceTypeService,
    private fb: FormBuilder) {
      this.createForm();
     }

  ngOnInit() {}

  ngOnChanges() {
    this.itemForm.reset( {
      itemID: this.item.fixedPriceTypeId,
      itemName: this.item.fixedPriceTypeName,
      itemDesc: this.item.fixedPriceTypeDesc} );
  }

  onSubmit() {
    this.itemForm.updateValueAndValidity();
    if (this.itemForm.invalid) {
      return;
    }

    const item: FixedPriceType = this.getProjectCostTypeFromFormValue(this.itemForm.value);
    if (item.fixedPriceTypeId !== null) {
      this.itemService.update(item.fixedPriceTypeId, item).subscribe(data => {
       // this.snackBar.open('Project Cost Type has been updated', '', {
       //   duration: 2000
       // });
        this.itemChange.emit(item);
      },
      error => this.error = error);
    } else {
      const newProjectCostType: CreateProjectCostType = {
            fixedPriceTypeName: item.fixedPriceTypeName,
            fixedPriceTypeDesc: item.fixedPriceTypeDesc};

      this.itemService.create(JSON.stringify(newProjectCostType)).subscribe(data => {
        // this.resetForm();
        this.item = data;
       
        this.itemChange.emit(item);
      },
      error => this.error = error);
    }
  }


  getProjectCostTypeFromFormValue(formValue: any): FixedPriceType {
    let item: FixedPriceType;
    item = new FixedPriceType();

    item.fixedPriceTypeId = formValue.itemID;
    item.fixedPriceTypeName = formValue.itemName;
    item.fixedPriceTypeDesc = formValue.itemDesc;
    return item;

  }

  createForm() {
    this.itemForm = this.fb.group({
      itemID: '',
      itemName: ['', Validators.required],
      itemDesc: ''
    }
    );
  }


  revert() {this.ngOnChanges(); }

  cancel() { this.itemChange.emit(this.item); }

}
