import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import '../rxjs-extensions';
import { UserRegistration, User, LoggedInUser } from '../models';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';

@Injectable()
export class UserService {
   
  _url = 'http://localhost:5000/api';
  loggedIn = false;
  loggedInUser: LoggedInUser;
  authorityToken: string;
  users: LoggedInUser[] = [];
  usersInRole: LoggedInUser[] = [];
  roles: any;


  // Observable navItem source
  private _authNavStatusSource = new BehaviorSubject<boolean>(false);
  // Observable navItem stream
  authNavStatus$ = this._authNavStatusSource.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  register(user: LoggedInUser) {
    const body = JSON.stringify(user);
    const headerOptions = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.http.post(this._url + '/accounts', body, { headers: headerOptions, responseType: 'text' })
      .map(res => true)
      .catch(x => this.handleAuthError(x));
  }

  update(id: string, user: LoggedInUser) {
    const body = JSON.stringify(user);
    const headerOptions = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.http.put(this._url + '/accounts/' + id, body, { headers: headerOptions, responseType: 'text' })
      .map(res => true)
      .catch(x => this.handleAuthError(x));
  }

  login(userName: string, password: string) {
    const body = JSON.stringify({ userName, password });
    const headerOptions = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.http.post(this._url + '/auth/login', body, { headers: headerOptions, responseType: 'text' })
      .map(res => {
        const tok = JSON.parse(JSON.parse(res));
        this.authorityToken = tok.auth_token;
        console.log('token', this.authorityToken);


        return true;
      })
      .catch(x => this.handleAuthError(x));

  }

  delete(userName: string): any {
    const authToken = this.authorityToken;
    const headerOptions = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + authToken);
      return this.http.delete(
        this._url + '/accounts/' + userName, { headers: headerOptions,  responseType: 'text' })
        .map( res => {
          return true;
        })
        .catch(x => this.handleAuthError(x));
  }

  getLoggedInUser(userName: string) {
    const authToken = this.authorityToken;
    const headerOptions = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + authToken);
    return this.http.get<LoggedInUser>(this._url + '/accounts/user/' + userName, { headers: headerOptions })
      .map(res => {
        let _loggedInUser = new LoggedInUser();
        _loggedInUser = res;

        this.loggedInUser = _loggedInUser;
        this.loggedIn = true;
        this._authNavStatusSource.next(true);
        console.log('Logged in');
        return _loggedInUser;
      })
      .catch(x => this.handleAuthError(x));

  }

  getAll() {
    const authToken = this.authorityToken;
    const headerOptions = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + authToken);
    return this.http.get<LoggedInUser[]>(this._url + '/accounts/users', { headers: headerOptions })
      .map(res => this.users = res
      )
      .catch(x => this.handleAuthError(x));

  }

  getRoles() {
    const authToken = localStorage.getItem('auth_token');
    const headerOptions = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + authToken);
    return this.http.get<string[]>(this._url + '/accounts/roles', { headers: headerOptions })
      .map(res => {
        this.roles = res;
        return this.roles;
      })
      .catch(x => this.handleAuthError(x));

  }

  getUserInRoles(roleName: string) {
    console.log('token', this.authorityToken);
    const authToken = this.authorityToken;
    const headerOptions = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + authToken);
    return this.http.get<LoggedInUser[]>(this._url + '/accounts/role/' + roleName, { headers: headerOptions })
      .map(res =>
        { this.usersInRole = res;
        return res; }
      )
      .catch(x => this.handleAuthError(x));
  }

  logOut() {
    this.loggedInUser = null;
    this.loggedIn = false;
    this.authorityToken = '';
    this._authNavStatusSource.next(true);
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  currentUser(): LoggedInUser {
    return this.loggedInUser;
  }


  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    const errMsg = JSON.parse(err.error);
    // handle your auth error or rethrow
    if (err.status === 401 || err.status === 403) {
      // navigate /delete cookies or whatever
      this.router.navigateByUrl('/login');
      // tslint:disable-next-line:max-line-length
      // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.

      return Observable.throw(errMsg);
    }
    return Observable.throw(errMsg);
  }
}


