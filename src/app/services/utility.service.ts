import { Injectable } from '@angular/core';

import {
  Project, Resource, ResourceMonth, Month,
  Phase, ResourceType, FixedPriceType, Role, Status, Group
} from '../models';
import { PhaseService } from './phase.service';
import { ResourceTypeService } from './resource-type.service';
import { FixedPriceTypeService } from './fixed-price-type.service';
import { RoleService, StatusService } from '../services';
import { GroupService } from './group.service';


@Injectable()
export class UtilityService {

  private _phaseList: Phase[];
  private _resourceTypeList: ResourceType[];
  private _fixedPriceTypeList: FixedPriceType[];
  private _roleList: Role[];




  phaseListIsDirty = false;
  resourceTypeListIsDirty = false;
  fixedPriceTypeListIsDirty = false;
  roleListIsDirty = false;
  statusListIsDirty = false;
  groupListIsDirty = false;

  error: any;


  constructor(private phaseService: PhaseService,
    private resourceTypeService: ResourceTypeService,
    private fixedPriceTypeService: FixedPriceTypeService,
    private roleService: RoleService,
    private groupService: GroupService,
    private statusService: StatusService) {
    this._phaseList = this.getPhaseList();
    this._fixedPriceTypeList = this.getFixedPriceTypeList();
    this._resourceTypeList = this.getResourceTypeList();
    this._roleList = this.getRoles();

  }

  // Get all of the codes
  // todo: update phase list when new phase has been added currently will only look once.
  getPhaseList(): Phase[] {
    if (this._phaseList === undefined || this.phaseListIsDirty) {
      this.phaseService.getAll()
        .subscribe(results => {

          this._phaseList = results;
          const type = new Phase();
          type.phaseId = -1;
          type.order = 0;
          type.phaseName = '--Select--';
          this._phaseList.push(type);
          this._phaseList.sort((leftSide, rightSide): number => {
            if (leftSide.order < rightSide.order) { return -1; }
            if (leftSide.order > rightSide.order) { return 1; }
            return 0;
          });
          this.phaseListIsDirty = false;
        },
          error => {
            this.error = error;

          });
    }
    return this._phaseList;
  }

  getFixedPriceTypeList(): FixedPriceType[] {
    if (this._fixedPriceTypeList === undefined || this.fixedPriceTypeListIsDirty) {
      this.fixedPriceTypeService.getAll()
        .subscribe(results => {
          this._fixedPriceTypeList = results;
          const type = new FixedPriceType();
          type.fixedPriceTypeId = -1;
          type.fixedPriceTypeName = '--Select--';
          this._fixedPriceTypeList.push(type);
          this._fixedPriceTypeList.sort((leftSide, rightSide): number => {
            if (leftSide.fixedPriceTypeId < rightSide.fixedPriceTypeId) { return -1; }
            if (leftSide.fixedPriceTypeId > rightSide.fixedPriceTypeId) { return 1; }
            return 0;
          });
          this.fixedPriceTypeListIsDirty = false;
        },
          error => this.error = error);
    }
    return this._fixedPriceTypeList;
  }

  getResourceTypeList(): ResourceType[] {
    if (this._resourceTypeList === undefined || this.resourceTypeListIsDirty) {
      this.resourceTypeService.getAll()
        .subscribe(results => {
          this._resourceTypeList = results;
          const type = new ResourceType();
          type.resourceTypeId = -1;
          type.resourceTypeName = '--Select--';
          this._resourceTypeList.push(type);
          this._resourceTypeList.sort((leftSide, rightSide): number => {
            if (leftSide.resourceTypeId < rightSide.resourceTypeId) { return -1; }
            if (leftSide.resourceTypeId > rightSide.resourceTypeId) { return 1; }
            return 0;
          });

        },
          error => this.error = error);

      this.resourceTypeListIsDirty = false;
    }

    return this._resourceTypeList;
  }

  getRoles(): Role[] {
    if (this._roleList === undefined || this.roleListIsDirty) {
      this.roleService.getAll().subscribe(results => {
        this._roleList = results;
        const role = new Role();
        role.roleId = -1;
        role.roleName = '--Select--';
        this._roleList.push(role);
        this._roleList.sort((leftSide, rightSide): number => {
          if (leftSide.roleId < rightSide.roleId) { return -1; }
          if (leftSide.roleId > rightSide.roleId) { return 1; }
          return 0;
        });

        this.roleListIsDirty = false;
      },
        error => this.error = error);
    }
    return this._roleList;
  }



  findRoleName(projectRoleId: number) {
    if (this._roleList === undefined ||
      this._roleList === null) {
      this.getRoles();
    }
    for (const role of this._roleList) {
      if (projectRoleId === role.roleId) {
        return role.roleName;
      }
    }
    return '';
  }

  findTypeName(resourceTypeId: number) {
    if (this._resourceTypeList === undefined ||
      this._resourceTypeList === null) {
      this.getResourceTypeList();
    }
    for (const type of this._resourceTypeList) {
      if (resourceTypeId === type.resourceTypeId) {
        return type.resourceTypeName;
      }
    }
    return '';
  }

  findFixedPriceTypeName(fixedPriceTypeId: number) {
    if (this._fixedPriceTypeList === undefined ||
      this._fixedPriceTypeList === null) {
      this.getResourceTypeList();
    }
    for (const type of this._fixedPriceTypeList) {
      if (fixedPriceTypeId === type.fixedPriceTypeId) {
        return type.fixedPriceTypeName;
      }
    }
    return '';
  }

  findPhaseName(phaseId: number) {
    if (this._phaseList === undefined ||
      this._phaseList === null) {
      this.getPhaseList();
    }
    for (const phase of this._phaseList) {
      if (phaseId === phase.phaseId) {
        return phase.phaseName;
      }
    }
    return '';
  }
}
