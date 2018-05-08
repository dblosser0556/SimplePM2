import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstractrestservice';
import { Group } from '../models';
import { UserService} from './user.service';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class GroupService extends
    AbstractRestService<Group> {

    constructor(http: Http, user: UserService ) {
        const apiUrl = environment.apiUrl;
        super(http, apiUrl + '/groups', user);

    }


    getOptionList(): Observable<Group[]> {
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Get,
            headers: headerOptions
        });
        return this._http.get(this.actionUrl, requestOptions)
            .map((res: Response) => {
                const results = res.json();
                const type = new Group();
                type.groupId = -1;
                type.groupName = '-Select-';
                results.push(type);
                const type1 = new Group();
                type1.groupId = 0;
                type1.groupName = 'No Parent';
                results.push(type1);
                results.sort((leftSide, rightSide): number => {
                if (leftSide.groupId < rightSide.groupId) { return -1; }
                if (leftSide.groupId > rightSide.groupId) { return 1; }
                return 0;
                 });
                 return results;
            })
            .pipe(catchError(this.handleError)
            );
    }
}
