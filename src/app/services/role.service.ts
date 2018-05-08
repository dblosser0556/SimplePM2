import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstractrestservice';
import { Role } from '../models';
import { UserService } from './user.service';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';


@Injectable()
export class RoleService extends
    AbstractRestService<Role> {

    constructor(http: Http, user: UserService ) {
        const apiUrl = environment.apiUrl;
        super(http, apiUrl + '/roles', user);
    }
}
