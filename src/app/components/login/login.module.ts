import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { HttpClientModule } from '@angular/common/http'


import { routing } from './login.routing';

import { LoginFormComponent } from './login-form.component';




@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, routing, HttpClientModule
  ],
  declarations: [LoginFormComponent],
  providers:    [ UserService ]
})
export class LoginModule { }
