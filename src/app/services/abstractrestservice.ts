// import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { UserService} from '../services';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';

export abstract class AbstractRestService<T> {

    constructor(protected _http: Http,
        protected actionUrl: string, protected user: UserService) {
    }

    getAll(): Observable<T[]> {
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Get,
            headers: headerOptions
        });
        return this._http.get(this.actionUrl, requestOptions)
            .map((res: Response) => res.json())
            .pipe(catchError(this.handleError)
            );
    }



    getOne(id: number): Observable<T> {
        const url = `${this.actionUrl}/${id}`;
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Get,
            headers: headerOptions
        });
        return this._http.get(url, requestOptions)
            .map((data: Response) => data.json())
            .pipe(catchError(this.handleError)
            );
    }

    create(newT: string) {
        const body = newT;
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Post,
            headers: headerOptions
        });
        return this._http.post(this.actionUrl, newT, requestOptions)
            .map(x => x)
            .pipe(catchError(this.handleError)
            );
    }

    update(id: number, t: T) {
        const body = JSON.stringify(t);
        const url = `${this.actionUrl}/${id}`;
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Put,
            headers: headerOptions
        });

        return this._http.put(url, body, requestOptions)
            .map(x => x)
            .pipe(
            catchError(this.handleError)
            );
    }

    delete(id: number) {
        const url = `${this.actionUrl}/${id}`;
        const headerOptions = this.getHeader();
        const requestOptions = new RequestOptions({
            method: RequestMethod.Delete,
            headers: headerOptions
        });
        return this._http.delete(url, requestOptions)
            .pipe(
            catchError(this.handleError)
            );

    }



    getHeader() {
        const httpHeader = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.user.authorityToken
        });
        return httpHeader;
    }

    handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
          const body = error.json() || '';
          const err = body.error || JSON.stringify(body);
          errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
          errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
