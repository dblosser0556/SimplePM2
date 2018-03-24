import { Injectable } from '@angular/core';
import { AbstractRestService } from '../../../services/abstractrestservice';
import { FixedPriceType } from '../../../models';
import { UserService } from '../../../services/user.service';
import { ConfigService } from '../../../services/config.service';
import { Http } from '@angular/http';




@Injectable()
export class FixedPriceTypeService extends
    AbstractRestService<FixedPriceType> {

    constructor(http: Http, user: UserService) {
        super(http, 'http://localhost:5000/api/' + 'fixedpricetypes', user);
    }
}
