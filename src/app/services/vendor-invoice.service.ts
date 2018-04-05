import { Injectable } from '@angular/core';
import { AbstractRestService } from '../services/abstractrestservice';
import { VendorInvoice } from '../models';
import { UserService } from '../services/user.service';
import { ConfigService } from '../services/config.service';
import { Http } from '@angular/http';




@Injectable()
export class VendorInvoiceService extends
    AbstractRestService<VendorInvoice> {

    constructor(http: Http, user: UserService) {
        super(http, 'http://localhost:5000/api/' + 'vendorinvoices', user);
    }
}
