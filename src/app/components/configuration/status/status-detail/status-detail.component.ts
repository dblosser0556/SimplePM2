import { Component, OnInit, Input, OnChanges, Output, EventEmitter  } from '@angular/core';
import { StatusService } from './../status.service';
import { Status } from '../../../../models';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

interface CreateStatus {
  statusName: string;
  statusDesc: string;
}

@Component({
  selector: 'app-status-detail',
  templateUrl: './status-detail.component.html',
  styleUrls: ['./status-detail.component.scss']
})
export class StatusDetailComponent implements OnInit, OnChanges {

 
  @Input() item: Status;
  @Output() itemChange = new EventEmitter<Status>();

  itemForm: FormGroup;
  error: any;

  constructor(private itemService: StatusService,
    private fb: FormBuilder) {
      this.createForm();
     }

  ngOnInit() {}

  ngOnChanges() {
    this.itemForm.reset( {
      itemID: this.item.statusId,
      itemName: this.item.statusName,
      itemDesc: this.item.statusDesc} );
  }

  onSubmit() {
    this.itemForm.updateValueAndValidity();
    if (this.itemForm.invalid) {
      return;
    }

    const item: Status = this.getStatusFromFormValue(this.itemForm.value);
    if (item.statusId !== null) {
      this.itemService.update(item.statusId, item).subscribe(data => {
        // this.snackBar.open('Project Status has been updated', '', {    duration: 2000 });
        this.itemChange.emit(item);
      },
      error => this.error = error);
    } else {
      const newStatus: CreateStatus = {
            statusName: item.statusName,
            statusDesc: item.statusDesc};

      this.itemService.create(JSON.stringify(newStatus)).subscribe(data => {
        // this.resetForm();
        this.item = data;
        // this.snackBar.open('Project Status has been Added', '', {          duration: 2000        });
        this.itemChange.emit(item);
      },
      error => this.error = error);
    }
  }


  getStatusFromFormValue(formValue: any): Status {
    let item: Status;
    item = new Status();

    item.statusId = formValue.itemID;
    item.statusName = formValue.itemName;
    item.statusDesc = formValue.itemDesc;
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
