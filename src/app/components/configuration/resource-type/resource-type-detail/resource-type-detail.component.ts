
import { Component, OnInit, Input, OnChanges, Output, EventEmitter  } from '@angular/core';
import { ResourceTypeService } from './../resource-type.service';
import { ResourceType } from '../../../../models';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

interface CreateResourceType {
  resourceTypeName: string;
  resourceTypeDesc: string;
}

@Component({
  selector: 'app-resource-type-detail',
  templateUrl: './resource-type-detail.component.html',
  styleUrls: ['./resource-type-detail.component.scss']
})
export class ResourceTypeDetailComponent implements OnInit, OnChanges {

 
  @Input() item: ResourceType;
  @Output() itemChange = new EventEmitter<string>();

  itemForm: FormGroup;
  error: any;

  constructor(private itemService: ResourceTypeService,
    private fb: FormBuilder) {
      this.createForm();
     }

  ngOnInit() {}

  ngOnChanges() {
    this.itemForm.reset( {
      itemID: this.item.resourceTypeId,
      itemName: this.item.resourceTypeName,
      itemDesc: this.item.resourceTypeDesc} );
  }

  onSubmit() {
    this.itemForm.updateValueAndValidity();
    if (this.itemForm.invalid) {
      return;
    }

    const item: ResourceType = this.getResourceTypeFromFormValue(this.itemForm.value);
    if (item.resourceTypeId !== null) {
      this.itemService.update(item.resourceTypeId, item).subscribe(data => {
        // this.snackBar.open('Resource Type has been updated', '', {duration: 2000});
        this.itemChange.emit('Resource Type has been updated');
      },
      error => this.error = error);
    } else {
      const newResourceType: CreateResourceType = {
            resourceTypeName: item.resourceTypeName,
            resourceTypeDesc: item.resourceTypeDesc};

      this.itemService.create(JSON.stringify(newResourceType)).subscribe(data => {
        // this.resetForm();
        this.item = data;
        // this.snackBar.open('Resource Type has been Added', '', {duration: 2000});
        this.itemChange.emit('Resource Type has been Added');
      },
      error => this.error = error);
    }
  }


  getResourceTypeFromFormValue(formValue: any): ResourceType {
    let item: ResourceType;
    item = new ResourceType();

    item.resourceTypeId = formValue.itemID;
    item.resourceTypeName = formValue.itemName;
    item.resourceTypeDesc = formValue.itemDesc;
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

  cancel() { this.itemChange.emit(null); }

}
