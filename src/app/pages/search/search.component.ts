import { Component } from '@angular/core';
import { BehaviorSubject, debounce, debounceTime, distinctUntilChanged, Subject, tap } from 'rxjs';
import { PaxUser } from 'src/app/models/users.model';
import { PaxSearchService } from 'src/app/services/pax-search.service';

import algoliasearch from 'algoliasearch';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

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
  private idx = this.algoliaSearch.initIndex('f3OmahaUserIdx');

  constructor(
    private readonly router: Router
  ) {
    this.searchValueBehaviorSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((val) => {
      this.searchPax(val);
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
    this.router.navigate(['users', paxId]);
  }

}
