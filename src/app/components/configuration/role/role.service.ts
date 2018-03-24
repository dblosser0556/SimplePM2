import { Injectable } from '@angular/core';
import { AbstractRestService } from '../../../services/abstractrestservice';
import { Role } from '../../../models';
import { UserService } from '../../../services/user.service';
import { Http } from '@angular/http';



@Injectable()
export class RoleService extends
    AbstractRestService<Role> {

    constructor(http: Http, user: UserService ) {
        super(http, 'http://localhost:5000/api/' + 'roles', user);
    }
}
