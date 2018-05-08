import { Injectable } from '@angular/core';
import { AbstractRestService } from '../services/abstractrestservice';
import { Milestone } from '../models';
import { UserService } from '../services/user.service';
import { ConfigService } from '../services/config.service';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';



@Injectable()
export class MilestoneService extends
    AbstractRestService<Milestone> {

    constructor(http: Http, user: UserService) {
        const apiUrl = environment.apiUrl;
        super(http, apiUrl + '/milestones', user);
    }
}
