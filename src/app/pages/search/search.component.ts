import { Component } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import algoliasearch from 'algoliasearch';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';
import { UserRole } from 'src/app/models/admin-user.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {

  public currentSearchValue: string = '';
  public searchValueBehaviorSubject = new Subject<string>();

  private resultPaxList = new BehaviorSubject<Array<any>>([]);
  public resultPaxList$ = this.resultPaxList.asObservable();

  private algoliaSearch = algoliasearch(environment.algoliasearch.APP_ID, environment.algoliasearch.API_KEY);
  private idx = this.algoliaSearch.initIndex('dev_f3OmahaPax');

  public isAdmin = false;

  constructor(
    private readonly router: Router,
    private readonly userAuthService: UserAuthenticationService
  ) {
    this.searchValueBehaviorSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((val) => {
      this.searchPax(val);
    });
    this.userAuthService.authUserData$.subscribe((res) => {
      if (res) {
        if (res.getRoles()?.includes(UserRole.Admin) || res.getRoles()?.includes(UserRole.SiteQ)) {
          this.isAdmin = true;
        }
      }
    })
  }

  async searchPax(searchValue: string) {
    // determine what we are searching, if debounce is hit, begin search
    if (searchValue === '') {
      this.resultPaxList.next([]);
      return;
    }

    this.idx.search(searchValue).then(({ hits }) => {
      this.resultPaxList.next(hits);
    });
  }

  routeToPaxPage(paxId: string) {
    if (this.isAdmin) {
      this.router.navigate(['users', paxId]);
    }
  }
}
