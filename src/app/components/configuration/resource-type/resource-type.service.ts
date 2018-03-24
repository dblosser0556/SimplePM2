import { Injectable } from '@angular/core';
import { AbstractRestService } from '../../../services/abstractrestservice';
import { ResourceType } from '../../../models';
import { UserService} from '../../../services/user.service';
import { Http } from '@angular/http';



@Injectable()
export class ResourceTypeService extends
    AbstractRestService<ResourceType> {

    constructor(http: Http, user: UserService ) {
        super(http, 'http://localhost:5000/api/' + 'resourcetypes', user);
    }
}
