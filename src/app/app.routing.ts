import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginFormComponent, HomeComponent } from './components';

const appRoutes: Routes = [
  { path: '', component: LoginFormComponent, data: { breadcrumb: 'Login'} },
  { path: 'home', component: HomeComponent, data: { breadcrumb: 'Home'} }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
