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
        if (status) {

          this.currentUser = this.user.currentUser();
          console.log('currentUser ', this.user.currentUser());
          console.log('currentUser ', this.currentUser);
          console.log('currentUser ', this.currentUser.currentUser.lastName);
        }
      });
    
  }

  logout() {
    this.user.logOut();
  }

  ngOnDestroy( ) {
    this.subLoginStatus.unsubscribe();
  }

 
}
