import { Component, OnInit, } from '@angular/core';
import { ConfigService } from '../../../services';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import '../../../rxjs-extensions';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit {
  pageTitle: string;
 
  errorMsg: string;
  isOpen = false;

  constructor(private config: ConfigService,
      private router: Router,
      private activatedRoute: ActivatedRoute) {
        this.isOpen = false;
       }

  ngOnInit() {
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
}
