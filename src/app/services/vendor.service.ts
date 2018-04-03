import { Injectable } from '@angular/core';
import { AbstractRestService } from '../services/abstractrestservice';
import { Vendor } from '../models';
import { UserService } from '../services/user.service';
import { ConfigService } from '../services/config.service';
import { Http } from '@angular/http';




@Injectable()
export class VendorService extends
    AbstractRestService<Vendor> {

    constructor(http: Http, user: UserService) {
        super(http, 'http://localhost:5000/api/' + 'vendors', user);
    }
}
