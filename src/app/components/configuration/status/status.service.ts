import { Injectable } from '@angular/core';
import { AbstractRestService } from '../../../services/abstractrestservice';
import { Status } from '../../../models';
import { UserService} from '../../../services/user.service';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';



@Injectable()
export class StatusService extends
    AbstractRestService<Status> {

    constructor(http: Http, user: UserService ) {
        super(http, 'http://localhost:5000/api/' + 'status', user);
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
                results.push(type);
                results.sort((leftSide, rightSide): number => {
                if (leftSide.statusId < rightSide.statusId) { return -1; }
                if (leftSide.statusId > rightSide.statusId) { return 1; }
                return 0;
                 });
                 return results;
            })
            .pipe(catchError(this.handleError)
            );
    }
}
