import { Component } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import algoliasearch from 'algoliasearch';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';
import { UserRole } from 'src/app/models/authenticated-user.model';
import { PhoneNumber } from 'src/app/models/phonenumber.model';

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

  public isAuthenticated = false;
  public hasClaimedData = false;

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
        this.isAuthenticated = true;
        if (res.paxDataId) {
          this.hasClaimedData = true;
        }
      }
    });

  }

  async searchPax(searchValue: string) {
    // determine what we are searching, if debounce is hit, begin search
    if (searchValue === '') {
      this.resultPaxList.next([]);
      return;
    }

    const searchableAttributes = ['f3Name', 'firstName'];
    if (this.hasClaimedData) {
      searchableAttributes.push('phoneNumber');
      searchableAttributes.push('lastName');
    }

    this.idx.search(searchValue, {
      restrictSearchableAttributes: searchableAttributes,
      attributesToRetrieve: searchableAttributes
    }).then(({ hits }) => {
      this.resultPaxList.next(hits);
    });
  }

  async routeToPaxPage(paxId: string) {
    if (this.hasClaimedData) {
      await this.router.navigate(['users', paxId]);
    }
  }

  async phoneCall(phoneNumber: string) {
    await window.navigator.clipboard.writeText(`${phoneNumber}`);
    alert("Phone number copied to clipboard");
  }

  async sendEmail(email: string) {
    await window.navigator.clipboard.writeText(`${email}`);
    alert("Email copied to clipboard");
  }

  async tryClaimF3Info(paxId: string) {

  }
}
