// auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private user: UserService, private router: Router) { }

    canActivate() {
        console.log('auth gaurd');
        console.log('logged in', this.user.isLoggedIn());
        if (!this.user.isLoggedIn()) {
            this.router.navigate(['/login']);
            return false;
        }

        return true;
    }
}
