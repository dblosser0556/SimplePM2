import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstractrestservice';
import { Characteristic } from '../models';
import { UserService } from './user.service';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { Http, Response, Headers, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class CharacteristicService extends
    AbstractRestService<Characteristic> {

    constructor(http: Http, user: UserService) {
        const apiUrl = environment.apiUrl;
        super(http, apiUrl + '/characteristics', user);

    }


    getByParentId(parentId: number): Observable<Characteristic[]> {
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Get,
            headers: headerOptions
        });

        requestOptions.params = new URLSearchParams();
        const key = '$filter';
        const filter = 'ParentId eq ' + parentId.toString();
        requestOptions.params.append(key, filter);

        return this._http.get(this.actionUrl, requestOptions)
            .map((res: Response) => res.json())
            .pipe(catchError(this.handleError)
            );
    }


}
