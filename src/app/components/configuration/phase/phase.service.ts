import { Injectable } from '@angular/core';
import { AbstractRestService } from '../../../services/abstractrestservice';
import { Phase } from '../../../models';
import { UserService } from '../../../services/user.service';
import { Http } from '@angular/http';

@Injectable()
export class PhaseService extends AbstractRestService<Phase> {

    constructor(http: Http, user: UserService) {
        super(http, 'http://localhost:5000/api/' + 'phases', user);
    }
}
