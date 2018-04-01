import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { DivisionsComponent } from './divisions/divisions.component';
import { ProgramsComponent } from './programs/programs.component';
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
      { path: 'divisions', component: DivisionsComponent, data: {'title': 'Divisions', 'breadcrumb': 'Divisions'} },
      { path: 'programs', component: ProgramsComponent, data: {'title': 'Programs', 'breadcrumb': 'Programs'} },
      { path: 'projects', data: {'title': 'Projects', 'breadcrumb': 'Projects'},
        children: [
          { path: '', component: ProjectsComponent, data: {'title': 'Projects', 'breadcrumb': 'Projects'} },
          { path: 'project', component: ProjectComponent, data: {'title': 'Project', 'breadcrumb': 'Project'} }
        ] },
      { path: 'myprojects', data: {'title': 'MyProjects', 'breadcrumb': 'MyProjects'},
        children: [
          { path: '', component: ProjectsComponent, data: {'title': 'MyProjects', 'breadcrumb': 'MyProjects'}},
          { path: 'project', component: ProjectComponent, data: {'title': 'Project', 'breadcrumb': 'Project'}}
        ] },

    ]
  }
]);
