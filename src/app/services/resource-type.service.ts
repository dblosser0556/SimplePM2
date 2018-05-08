import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstractrestservice';
import { ResourceType } from '../models';
import { UserService} from './user.service';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';


@Injectable()
export class ResourceTypeService extends
    AbstractRestService<ResourceType> {

    constructor(http: Http, user: UserService ) {
        const apiUrl = environment.apiUrl;
        super(http, apiUrl + '/resourcetypes', user);
    }
}
