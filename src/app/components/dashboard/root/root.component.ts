import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigService, UserService} from '../../../services';
import { Subscription } from 'rxjs/Subscription';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import '../../../rxjs-extensions';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit, OnDestroy {
  pageTitle: string;
  subSideBarActiveStatus: Subscription;
  subRouter: Subscription;
  errorMsg: string;


  constructor(private config: ConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private user: UserService) {

  }

  ngOnInit() {

    this.subRouter = this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .map((route) => {
        while (route.firstChild) { route = route.firstChild; }
        console.log(route.outlet);
        return route;
      })
      .filter((route) => route.outlet === 'primary')
      .mergeMap((route) => route.data)
      .subscribe((event) => this.pageTitle = event['title']);
  }


  isProjectManager(): boolean {
    return this.user.hasRole('editProjects');
  }

  isProgramManager(): boolean {
    return this.user.hasRole('editPrograms');
  }
  
  ngOnDestroy() {
    if (this.subSideBarActiveStatus) {
      this.subSideBarActiveStatus.unsubscribe();
    }
    if (this.subRouter) {
      this.subRouter.unsubscribe();
    }
  }

}
