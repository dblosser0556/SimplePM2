import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, ConfigService } from '../../services';
import { Subscription } from 'rxjs/Subscription';
import { LoggedInUser } from '../../models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  status: boolean;
  sideBarActive: boolean;
  subLoginStatus: Subscription;
  currentUser: LoggedInUser;
  constructor(private user: UserService, private config: ConfigService) { }

  ngOnInit( ) {
    this.subLoginStatus = this.user.authNavStatus$.subscribe(
      status => { this.status = status;
        console.log('Status change fired');
        if (status) {

          this.currentUser = this.user.currentUser();
          console.log('currentUser ', this.user.currentUser());
          console.log('currentUser ', this.currentUser);
          console.log('currentUser ', this.currentUser.currentUser.lastName);
        }
      });
    this.sideBarActive = false;
  }

  logout() {
    this.user.logOut();
  }

  ngOnDestroy( ) {
    this.subLoginStatus.unsubscribe();
  }

  setSideBarActiveStatus() {
    this.sideBarActive = !this.sideBarActive;
    this.config.setSideBarActiveState(this.sideBarActive);
 
  }

}
