import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstractrestservice';
import { Phase } from '../models';
import { UserService } from './user.service';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class PhaseService extends AbstractRestService<Phase> {

    constructor(http: Http, user: UserService) {
        const apiUrl = environment.apiUrl;
        super(http, apiUrl + '/phases', user);
    }
}
