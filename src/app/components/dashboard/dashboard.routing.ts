import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { DivisionsComponent } from './divisions/divisions.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectComponent } from '../project/project.component';
import { RootComponent } from './root/root.component';
import { AuthGuard } from '../../guard/auth.guard';


export const dashboardRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: 'dashboard',
    component: RootComponent, canActivate: [AuthGuard], data: {'title': 'Dashboard', 'breadcrumb': 'Dashboard'},

    children: [
      { path: '', component: HomeComponent, data: {'title': 'Home', 'breadcrumb': 'Home'} },
      { path: 'home', component: HomeComponent, data: {'title': 'Home', 'breadcrumb': 'Home'} },
      { path: 'scorecard', component: HomeComponent, data: {'title': 'Scorecard', 'breadcrumb': 'Scorecard'} },
      { path: 'forecast', component: DivisionsComponent, data: {'title': 'Forecast', 'breadcrumb': 'Forecast'} },
      { path: 'projects', data: {'title': 'Projects', 'breadcrumb': 'Projects'},
        children: [
          { path: '', component: ProjectsComponent, data: {'title': 'Projects', 'breadcrumb': ''} },
          { path: 'project', component: ProjectComponent, data: {'title': 'Project', 'breadcrumb': 'Project'} }
        ] },
      { path: 'myprojects', data: {'title': '', 'breadcrumb': 'MyProjects'},
        children: [
          { path: '', component: ProjectsComponent, data: {'title': 'MyProjects', 'breadcrumb': ''}},
          { path: 'project', component: ProjectComponent, data: {'title': 'Project', 'breadcrumb': 'Project'}}
        ] },

    ]
  }
]);
