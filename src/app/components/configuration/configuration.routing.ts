import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
    RootComponent,
    PhaseListComponent,
    FixedPriceTypeComponent,
    RoleComponent,
    StatusComponent,
    ResourceTypeComponent,
    AccountListComponent,
    GroupComponent
 } from '../configuration';





    export const routing: ModuleWithProviders = RouterModule.forChild([
        {
          path: 'configuration',
          component: RootComponent, data: {'title': 'root', 'breadcrumb': 'Configuration'},

          children: [

            { path: 'role', component: RoleComponent, data: {'title': 'Project Roles', 'breadcrumb': 'Roles'} },
            { path: 'phase', component: PhaseListComponent, data: {'title': 'Phases', 'breadcrumb': 'Phase'} },
            { path: 'fixedpricetype', component: FixedPriceTypeComponent, data: {'title': 'Fixed Price Types'} },
            { path: 'status', component: StatusComponent, data: {'title': 'Configure Project Status', 'breadcrumb': 'Status'} },
            { path: 'resourcetype', component: ResourceTypeComponent, data: {'title': 'Configure Resource Types', 'breadcrumb': 'Types'} },
            { path: 'accounts', component: AccountListComponent, data: {'title': 'Configure Users', 'breadcrumb': 'Users'} },
            { path: 'group', component: GroupComponent, data: {'title': 'Configure Project Groups', 'breadcrumb': 'Groups'} },

          ]
        }
      ]);
