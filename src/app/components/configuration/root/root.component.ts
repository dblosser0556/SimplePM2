import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigService } from '../../../services';
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
  active = false;
  subSideBarActiveStatus: Subscription;
  subErrors: Subscription;
  errorMsg: string;
  isOpen = false;

  constructor(private config: ConfigService,
      private router: Router,
      private activatedRoute: ActivatedRoute) {
        this.isOpen = false;
       }

  ngOnInit() {


    this.subSideBarActiveStatus = this.config.sidebarActiveStatus$.subscribe(
      active => this.active = active);

      this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .map((route) => {
        while (route.firstChild) { route = route.firstChild; }
        return route;
      })
      .filter((route) => route.outlet === 'primary')
      .mergeMap((route) => route.data)
      .subscribe((event) => this.pageTitle = event['title']);
  }

  isActive() {
    return this.active;
  }

  ngOnDestroy() {
    this.subSideBarActiveStatus.unsubscribe();
  }



}
