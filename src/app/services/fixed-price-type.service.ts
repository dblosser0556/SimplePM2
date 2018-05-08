import { Injectable } from '@angular/core';
import { AbstractRestService } from './../services/abstractrestservice';
import { FixedPriceType } from './../models';
import { UserService } from './../services/user.service';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';




@Injectable()
export class FixedPriceTypeService extends
    AbstractRestService<FixedPriceType> {

    constructor(http: Http, user: UserService) {
        const apiUrl = environment.apiUrl;
        super(http, apiUrl + '/fixedpricetypes', user);
    }
}
