import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { UserService} from '../../../../services';
import { UserRegistration, LoggedInUser, User, UserRole } from '../../../../models';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, FormArray } from '@angular/forms';
import { Subscriber } from 'rxjs/Subscriber';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss']
})

export class RegistrationFormComponent implements OnInit, OnChanges {

  @Input() user: LoggedInUser;
  @Input() roles: string[];
  @Output() userChange = new EventEmitter<LoggedInUser>();


  submitted = false;
  isRequesting = false;
  errors = '';
  userRegistration: UserRegistration;
  registrationForm: FormGroup;

  constructor(private userService: UserService,
    private router: Router,
    private fb: FormBuilder) {
      this.createForm();
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.registrationForm.reset( {
      userId: this.user.currentUser.userId,
      firstName: this.user.currentUser.firstName,
      lastName: this.user.currentUser.lastName,
      userName: this.user.currentUser.userName,
      email: this.user.currentUser.email,
      password: this.user.currentUser.password,
    } );
    this.registrationForm.setControl('roleList', this.buildRoles());
  }

  onSubmit() {
    this.registrationForm.updateValueAndValidity();
    if (this.registrationForm.invalid) {
      return;
    }



    this.user = this.getUserRegistrationFromFormValue(this.registrationForm.value);
    this.submitted = true;
    this.isRequesting = true;
    this.errors = '';

    if (this.user.currentUser.userId === null) {
    this.userService.register(this.user)
      .subscribe(result => {
        if (result) {
          this.isRequesting = false;
          this.userChange.emit(this.user);
        }
      },
        errors => this.errors = errors);
  } else {
    this.userService.update(this.user.currentUser.userId, this.user)
      .subscribe(result => {
        if (result) {
          this.isRequesting = false;
          this.userChange.emit(this.user);
        }
      },
    errors => this.errors = errors);
  }
}



  getUserRegistrationFromFormValue(formValue: any): LoggedInUser {
    const userRegistration = formValue;
    let _loggedInUser: LoggedInUser;
    _loggedInUser = new LoggedInUser();

    _loggedInUser.currentUser.userName = formValue.userName;
    _loggedInUser.currentUser.userId = formValue.userId;
    _loggedInUser.currentUser.firstName = formValue.firstName;
    _loggedInUser.currentUser.lastName = formValue.lastName;
    _loggedInUser.currentUser.email = formValue.email;
    _loggedInUser.currentUser.password = formValue.password;

    formValue.roleList.map((r , i) => {
      const _userRole = new UserRole();
      _userRole.roleName = this.user.roles[i].roleName;
      _userRole.selected = r;
      _loggedInUser.roles.push(_userRole);

    });
    return _loggedInUser;

  }
  createForm() {
    this.registrationForm = this.fb.group({
      userId: '',
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      roleList: this.fb.array([])
    }
    );

  }

  buildRoles() {
    const arr = this.user.roles.map( r => {
      return this.fb.control(r.selected);
    });
    return this.fb.array(arr);
  }

  get roleList(): FormArray {
    return this.registrationForm.get('roleList') as FormArray;
  }

  revert() {this.ngOnChanges(); }

  cancel() { this.userChange.emit(this.user); }

}
