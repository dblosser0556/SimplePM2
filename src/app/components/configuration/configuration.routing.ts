import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
    RootComponent,
    PhaseListComponent,
    FixedPriceTypeComponent,
    FixedPriceTypeDetailComponent,
    RoleComponent,
    RoleDetailComponent,
    StatusComponent,
    ResourceTypeComponent,
    ResourceTypeDetailComponent,
    AccountListComponent,
    RegistrationFormComponent,
    GroupComponent,
    GroupDetailComponent,
    ProjectConfigComponent,
 } from '../configuration';

import { ProjectComponent } from '../project/project.component';



    export const configurationRouting: ModuleWithProviders = RouterModule.forChild([
        {
          path: 'configuration',
          component: RootComponent, data: {'title': 'root', 'breadcrumb': 'Configuration'},

          children: [

            { path: 'role', component: RoleComponent, data: {'title': 'Project Roles', 'breadcrumb': 'Roles'},
              children: [
                { path: '', component: RoleComponent, data: {'title': 'Configure Project Roles', 'breadcrumb': 'Users'}},
                { path: 'details', component: RoleDetailComponent, data: {'title': 'Edit or Create Role', 'breadcrumb': 'Role'}},
            ] },
            { path: 'phase', component: PhaseListComponent, data: {'title': 'Phases', 'breadcrumb': 'Phase'} },
            { path: 'fixedpricetype', data: {'title': 'Fixed Price Types'},
              children: [
                { path: '', component: FixedPriceTypeComponent, data: {'title': 'Configure Resource Types', 'breadcrumb': 'ResourceTypes'}},
                { path: 'details', component: FixedPriceTypeDetailComponent,
                  data: {'title': 'Edit or Create Resource Type', 'breadcrumb': 'ResourceType'}},
              ]},
            { path: 'status', component: StatusComponent, data: {'title': 'Configure Project Status', 'breadcrumb': 'Status'} },
            { path: 'resourcetype', data: {'title': 'Configure Resource Types', 'breadcrumb': 'Types'},
              children: [
                { path: '', component: ResourceTypeComponent, data: {'title': 'Configure Resource Types', 'breadcrumb': 'ResourceTypes'}},
                { path: 'details', component: ResourceTypeDetailComponent,
                    data: {'title': 'Edit or Create Resource Type', 'breadcrumb': 'ResourceType'}},
              ]},
            { path: 'accounts', data: {'title': 'Configure Users', 'breadcrumb': 'Users'},
               children: [
                { path: '', component: AccountListComponent, data: {'title': 'Configure Users', 'breadcrumb': 'Users'}},
                { path: 'register', component: RegistrationFormComponent, data: {'title': 'Edit or Create User', 'breadcrumb': 'User'}},
               ]},

            { path: 'groups', data: {'title': 'Configure Project Groups', 'breadcrumb': 'Groups'},
              children: [
                { path: '', component: GroupComponent, data: {'title': 'Configure Project Groups', 'breadcrumb': 'Groups'}},
                { path: 'details', component: GroupDetailComponent, data: {'title': 'Edit Project Group', 'breadcrumb': 'Group'}},
              ]},
              { path: 'projects', data: {'title': 'Configure Projects', 'breadcrumb': 'Projects'},
              children: [
                { path: '', component: ProjectConfigComponent, data: {'title': 'Configure Projects', 'breadcrumb': 'Projects'}},
                { path: 'details', component: ProjectComponent, data: {'title': 'Edit Project', 'breadcrumb': 'Project'}},
              ]},
              { path: 'templates', data: {'title': 'Configure Templates', 'breadcrumb': 'Templates'},
              children: [
                { path: '', component: ProjectConfigComponent, data: {'title': 'Configure Templates', 'breadcrumb': 'Templates'}},
                { path: 'details', component: ProjectComponent, data: {'title': 'Edit Project Template', 'breadcrumb': 'Template'}},
              ]},
          ]
        }
      ]);
