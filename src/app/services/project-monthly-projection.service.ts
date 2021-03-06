import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstractrestservice';
import { ProjectMonthlyProjection } from '../models';
import { UserService } from './user.service';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class ProjectMonthlyProjectionService extends AbstractRestService<ProjectMonthlyProjection> {

    constructor(http: Http, user: UserService) {
        const apiUrl = environment.apiUrl;
        super(http, apiUrl + '/projectmonthlyprojections', user);
    }
}
