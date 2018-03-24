import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstractrestservice';
import { Budget } from '../models';
import { UserService } from './user.service';
import { Http, RequestOptions, RequestMethod, Response, Headers, URLSearchParams } from '@angular/http';
import { Observable, } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';

@Injectable()
export class BudgetService extends AbstractRestService<Budget> {

    constructor(http: Http, user: UserService) {
        super(http, 'http://localhost:5000/api/' + 'budgets', user);
    }

    getList(params?: any): Observable<Budget[]> {
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Get,
            headers: headerOptions
        });

        if (params !== undefined) {
            requestOptions.params = new URLSearchParams();
            const keys = Object.keys(params);
            for (const key of keys) {
                requestOptions.params.append(key, params[key]);
            }
        }
        return this._http.get(this.actionUrl, requestOptions)
            .map((res: Response) => res.json())
            .pipe(catchError(this.handleError)
            );
    }
}
