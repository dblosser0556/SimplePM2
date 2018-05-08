import { Injectable } from '@angular/core';
import { AbstractRestService } from '../services/abstractrestservice';
import { VendorInvoice } from '../models';
import { UserService } from '../services/user.service';
import { ConfigService } from '../services/config.service';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';



@Injectable()
export class VendorInvoiceService extends
    AbstractRestService<VendorInvoice> {

    constructor(http: Http, user: UserService) {
        const apiUrl = environment.apiUrl;
        super(http, apiUrl + '/vendorinvoices', user);
    }
}
