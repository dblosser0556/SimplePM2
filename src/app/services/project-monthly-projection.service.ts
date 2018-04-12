import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstractrestservice';
import { ProjectMonthlyProjection } from '../models';
import { UserService } from './user.service';
import { Http } from '@angular/http';


@Injectable()
export class ProjectMonthlyProjectionService extends AbstractRestService<ProjectMonthlyProjection> {

    constructor(http: Http, user: UserService) {
        super(http, 'http://localhost:5000/api/' + 'projectmonthlyprojections', user);
    }
}
