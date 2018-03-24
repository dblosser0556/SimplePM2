import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoginFormComponent } from './login-form.component';



export const routing: ModuleWithProviders = RouterModule.forChild([

  { path: 'login', component: LoginFormComponent, data: {'title': 'Login',  'breadcrumb': 'Login'}}
]);
