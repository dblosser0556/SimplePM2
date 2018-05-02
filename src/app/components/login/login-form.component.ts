import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';

import { UserService } from '../../services';
import { HttpErrorResponse } from '@angular/common/http/src/response';

export interface UserLogin {
  userName: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})


export class LoginFormComponent implements OnInit {



  errors: any;
  isRequesting: boolean;
  submitted = false;
  userName: string;

  loginForm: FormGroup;

  constructor(private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.createForm();
  }



  login() {
    this.loginForm.updateValueAndValidity();
    if (this.loginForm.invalid) {
      return;
    }
    const user: UserLogin = this.getUserFromFormValue(this.loginForm.value);

    this.submitted = true;
    this.isRequesting = true;
    this.errors = '';

    this.userService.login(user.userName, user.password)
      .subscribe(result => {

        if (result) {
          this.userService.getLoggedInUser(user.userName)
            .subscribe(result2 => {
              this.isRequesting = false;
              this.router.navigate(['/dashboard']);
            },
              error => {
                this.isRequesting = false;
                this.errors = error.message;
              }
            );
        }
      },
        error => {
          this.errors = error;
          this.isRequesting = false;
        });
  }


  createForm() {
    this.loginForm = this.fb.group({
      userName: '',
      password: ['', Validators.required]

    }
    );
  }

  getUserFromFormValue(formValue: any): UserLogin {

    const item: UserLogin = {
      userName: formValue.userName,
      password: formValue.password
    };

    return item;

  }

}

