import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../../../services';
import { UserRegistration, LoggedInUser, User, UserRole } from '../../../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, FormArray } from '@angular/forms';
import { Subscriber } from 'rxjs/Subscriber';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss']
})

export class RegistrationFormComponent implements OnInit, OnChanges {

  user: LoggedInUser;
  roles: string[];


  submitted = false;
  isLoading = false;
  errors = '';
  userRegistration: UserRegistration;
  registrationForm: FormGroup;


  constructor(private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toast: ToastrService) {
    this.createForm();
  }

  ngOnInit() {
    this.getData();
  }

  ngOnChanges() {
    this.registrationForm.reset({
      userId: this.user.currentUser.userId,
      firstName: this.user.currentUser.firstName,
      lastName: this.user.currentUser.lastName,
      userName: this.user.currentUser.userName,
      email: this.user.currentUser.email,
      password: this.user.currentUser.password,
    });
    this.registrationForm.setControl('roleList', this.buildRoles());
  }

  onSubmit() {
    this.registrationForm.updateValueAndValidity();
    if (this.registrationForm.invalid) {
      return;
    }



    this.user = this.getUserRegistrationFromFormValue(this.registrationForm.value);
    this.submitted = true;
    this.errors = '';

    if (this.user.currentUser.userId === null) {
      this.userService.register(this.user)
        .subscribe(result => {
          if (result) {

            this.toast.success('User Added', 'Success');
            this.router.navigate(['/configuration/accounts']);
          }
        },
          errors => {
            this.toast.error('Oops', errors);
            console.log(errors);

          });
    } else {
      this.userService.update(this.user.currentUser.userId, this.user)
        .subscribe(result => {
          if (result) {
 
            this.toast.success('User Updated', 'Success');
            this.router.navigate(['/configuration/accounts']);
          }
        },
          errors => {
            this.toast.error(errors, 'Oops');
            console.log(errors);
          });
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

    formValue.roleList.map((r, i) => {
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
    const arr = this.user.roles.map(r => {
      return this.fb.control(r.selected);
    });
    return this.fb.array(arr);
  }

  get roleList(): FormArray {
    return this.registrationForm.get('roleList') as FormArray;
  }

  revert() { this.ngOnChanges(); }

  cancel() { this.router.navigate(['/configuration/accounts']); }

  getData() {
    this.isLoading = true;
    this.userService.getRoles().subscribe(
      results => {
        this.roles = results;
        this.getUser();
      },
      errors => {
        this.toast.error(errors, 'Oops' );
        console.log(errors);
      });
  }

  getUser() {
    this.isLoading = true;
    this.route.queryParams
      .filter(params => params.userId)
      .subscribe(params => {
        const id = params.userId;
        if (id === '-1') {

          // this is an add as a negative id is passed
          this.user = new LoggedInUser();
          this.roles.forEach(role => {
            const _userRole = new UserRole();
            _userRole.roleName = role;
            _userRole.selected = false;
            this.user.roles.push(_userRole);
        });
          this.ngOnChanges();
          this.isLoading = false;
        } else {
          this.userService.getLoggedInUser(id).subscribe(
            results => {
              this.user = results;
              this.ngOnChanges();
              this.isLoading = false;
            },
            errors => {
              this.toast.error(errors, 'Oops');
              console.log(errors);
            });
        }
      });
  }
}

