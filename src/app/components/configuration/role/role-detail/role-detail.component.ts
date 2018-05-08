import { Component, OnInit, Input, OnChanges, Output, EventEmitter  } from '@angular/core';
import { RoleService } from '../../../../services';
import { Role } from '../../../../models';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';


interface CreateRole {
  roleName: string;
  roleDesc: string;
}

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss']
})
export class RoleDetailComponent implements OnInit, OnChanges {




  @Input() item: Role;
  @Output() itemChange = new EventEmitter<Role>();

  itemForm: FormGroup;
  error: any;

  constructor(private itemService: RoleService,
    private fb: FormBuilder) {
      this.createForm();
     }

  ngOnInit() {}

  ngOnChanges() {
    this.itemForm.reset( {
      itemId: this.item.roleId,
      itemName: this.item.roleName,
      itemDesc: this.item.roleDesc} );
  }

  onSubmit() {
    this.itemForm.updateValueAndValidity();
    if (this.itemForm.invalid) {
      return;
    }

    const item: Role = this.getRoleFromFormValue(this.itemForm.value);
    if (item.roleId !== null) {
      this.itemService.update(item.roleId, item).subscribe(data => {
        // this.snackBar.open('Project Cost Type has been updated', '', {duration: 2000});
        this.itemChange.emit(item);
      },
      error => this.error = error);
    } else {
      const newRole: CreateRole = {
            roleName: item.roleName,
            roleDesc: item.roleDesc};

      this.itemService.create(JSON.stringify(newRole)).subscribe(data => {
        // this.resetForm();
        this.item = data;
        // this.snackBar.open('Project Cost Type has been Added', '', { duration: 2000 });
        this.itemChange.emit(item);
      },
      error => this.error = error);
    }
  }


  getRoleFromFormValue(formValue: any): Role {
    let item: Role;
    item = new Role();

    item.roleId = formValue.itemId;
    item.roleName = formValue.itemName;
    item.roleDesc = formValue.itemDesc;
    return item;

  }

  createForm() {
    this.itemForm = this.fb.group({
      itemId: '',
      itemName: ['', Validators.required],
      itemDesc: ''
    }
    );
  }


  revert() {this.ngOnChanges(); }

  cancel() { this.itemChange.emit(this.item); }

}
