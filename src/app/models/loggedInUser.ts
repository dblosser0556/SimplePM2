import { User } from './user';
import { UserRole } from './user-role';

export class LoggedInUser {
    currentUser: User;
    roles: UserRole[];

    constructor() {
        this.currentUser = new User();
        this.roles = new Array<UserRole>();
    }


}
