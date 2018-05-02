import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginFormComponent, HomeComponent } from './components';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

const appRoutes: Routes = [
  { path: '', component: LoginFormComponent, data: { breadcrumb: 'Login'} },
  { path: 'login', component: LoginFormComponent, data: { breadcrumb: 'Login'} },
  { path: 'home', component: HomeComponent, data: { breadcrumb: 'Home'} },
  { path: '**', component: PageNotFoundComponent, data: {breadcrumb: 'PageNotFound'}}

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
