import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstractrestservice';
import { ProjectMilestone } from '../models';
import { UserService } from './user.service';
import { Http } from '@angular/http';


@Injectable()
export class ProjectMilestoneService extends AbstractRestService<ProjectMilestone> {

    constructor(http: Http, user: UserService) {
        super(http, 'http://localhost:5000/api/' + 'projectmilestones', user);
    }
}
