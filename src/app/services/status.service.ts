import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstractrestservice';
import { Status } from '../models';
import { UserService} from './user.service';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { environment } from '../../environments/environment';



@Injectable()
export class StatusService extends
    AbstractRestService<Status> {

    constructor(http: Http, user: UserService ) {
        const apiUrl = environment.apiUrl;
        super(http, apiUrl + '/status', user);
    }


    getOptionList(): Observable<Status[]> {
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Get,
            headers: headerOptions
        });
        return this._http.get(this.actionUrl, requestOptions)
            .map((res: Response) => {
                const results = res.json();
                const type = new Status();
                type.statusId = -1;
                type.statusName = '-Select-';
                type.order = 0;
                type.dashboard = false;
                type.disabled = false;
                type.statusDesc = 'Please select';
                results.push(type);
                results.sort((leftSide, rightSide): number => {
                if (leftSide.order < rightSide.order) { return -1; }
                if (leftSide.order > rightSide.order) { return 1; }
                return 0;
                 });
                 return results;
            })
            .pipe(catchError(this.handleError)
            );
    }
}
