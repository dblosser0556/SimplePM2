import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstractrestservice';
import { ConfigService } from './config.service';
import { Project, ProjectList } from '../models';
import { UserService } from './user.service';
import { Http, Response, Headers, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class ProjectService extends
    AbstractRestService<Project> {

    constructor(http: Http, user: UserService, private config: ConfigService) {
        super(http, 'http://localhost:5000/api/' + 'projects', user);
    }

    getList(params?: any): Observable<ProjectList[]> {
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

    getOne(id: number): Observable<Project> {
        const url = `${this.actionUrl}/${id}`;
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Get,
            headers: headerOptions
        });
        return this._http.get(url, requestOptions)
            .map((data: Response) => data.json())
            .map((data: Project) => new Project(data))
            .pipe(catchError(this.handleError)
            );
    }

    update(id: number, t: Project) {
        const body = JSON.stringify(t);
        const url = `${this.actionUrl}/${id}`;
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Put,
            headers: headerOptions
        });

        return this._http.put(url, body, requestOptions)
            .map((data: Response) => data.json())
            .map((data: Project) => new Project(data))
            .pipe(
            catchError(this.handleError)
            );
    }

    create(newT: string) {
        const body = newT;
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Post,
            headers: headerOptions
        });
        return this._http.put(this.actionUrl, body, requestOptions)
            .map((data: Response) => data.json())
            .map((data: Project) => new Project(data))
            .pipe(
            catchError(this.handleError)
            );
    }
}
