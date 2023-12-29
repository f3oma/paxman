import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import algoliasearch from 'algoliasearch';
import { BehaviorSubject, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthenticatedUser } from 'src/app/models/authenticated-user.model';
import { PhoneNumber } from 'src/app/models/phonenumber.model';
import { IClaimUserInfo, IPaxUser, PaxUser } from 'src/app/models/users.model';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';
import { environment } from 'src/environments/environment';

interface ClaimDataAlgoliaResult {
  firstName: string;
  f3Name: string;
  objectID: string;
  path: string;
}

export interface DialogData {
  lastName: string;
}

@Component({
  selector: 'app-claim-pax-info',
  templateUrl: './claim-pax-info.component.html',
  styleUrls: ['./claim-pax-info.component.scss']
})
export class ClaimPaxInfoComponent {

  public currentSearchValue: string = '';
  public searchValueBehaviorSubject = new Subject<string>();

  private resultPaxList = new BehaviorSubject<Array<any>>([]);
  public resultPaxList$ = this.resultPaxList.asObservable();

  private algoliaSearch = algoliasearch(environment.algoliasearch.APP_ID, environment.algoliasearch.API_KEY);
  private idx = this.algoliaSearch.initIndex('dev_f3OmahaPax');

  form: FormGroup = new FormGroup({
    f3Name: new FormControl('', [Validators.required]),
    tel: new FormControl(new PhoneNumber('', '', ''), [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email])
  });
  errorMessage = "";
  searched = false;

  authenticatedUser: AuthenticatedUser | undefined;
  paxForDisplay: Array<IPaxUser> = [];
  originalPaxResult: Array<PaxUser> = [];
  loggedInEmailMatchFound: boolean = false;
  loggedInMatchedUserData: IPaxUser | undefined = undefined;

  constructor(
    private userAuth: UserAuthenticationService,
    private router: Router,
    private paxManagerService: PaxManagerService,
    private dialog: MatDialog
  ) {
    this.userAuth.authUserData$.subscribe((res) => {
      this.authenticatedUser = res;
      if (res) {
        this.tryInitialEmailClaim();
      }
    })

    this.searchValueBehaviorSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((val) => {
      this.searchPax(val);
    });
  }

  async searchPax(searchValue: string) {
    // determine what we are searching, if debounce is hit, begin search
    if (searchValue === '') {
      this.resultPaxList.next([]);
      return;
    }

    this.idx.search(searchValue, {
      typoTolerance: false,
      restrictSearchableAttributes: ['f3Name', 'firstName', 'lastName'],
      attributesToRetrieve: [
        'f3Name',
        'firstName',
        'path'
      ],
      attributesToHighlight: []
    }).then(({ hits }) => {
      this.resultPaxList.next(hits);
    });
  }

  public async claimDataFromSearch(algoliaSearchResult: ClaimDataAlgoliaResult) {
    // Try and look up the record via path
    const document = await this.paxManagerService.getUserReference(algoliaSearchResult.path);
    if (document) {
      const paxData = await this.paxManagerService.getPaxInfoByRef(document);
      if (paxData) {
        const dialogRef = this.dialog.open(ClaimDataConfirmationDialog, {
          data: {
            lastName: paxData.lastName
          }
        });
        dialogRef.afterClosed().subscribe(async (successfulValidation) => {
          if (successfulValidation === undefined) {

          } else if (successfulValidation) {
            await this.claimData(paxData);
          } else {
            alert("Claim validation failed");
          }
        });
        return;
      }
    } else {
      throw new Error("Something went wrong");
    }
  }


  public getEmailErrorMessage(): string {
    if (this.form.controls['email'].hasError('required')) {
      return 'You must enter a value';
    }
    return this.form.controls['email'].hasError('email') ? 'Not a valid email' : '';
  }

  // If the user says an F3 name exists, we need to figure out a solution to satisfy
  // Possibly list close names??
  public getF3NameError(): string {
    // If the name entered does not exist, get related names that might match from Algolia
    if (this.form.controls['f3Name'].getError('nameDoesNotExist')) {
      return "This F3 name exists in F3Omaha";
    }
    return '';
  }

  // Uses logged in info to try and match against pax
  public async tryInitialEmailClaim() {
    if (this.authenticatedUser) {
      const info: Partial<IClaimUserInfo> = {
        email: this.authenticatedUser.email
      };
      const res = await this.userAuth.tryClaimF3Info(this.authenticatedUser, info);
      if (res.length > 0) {
        this.loggedInEmailMatchFound = true;
        const props = res[0].toProperties();
        this.loggedInMatchedUserData = props;
        this.originalPaxResult = res;
      }
    }
  }

  public async tryClaimF3Info() {
    if (this.form.valid && this.authenticatedUser) {
      const info: IClaimUserInfo = {
        f3Name: this.form.controls['f3Name'].value,
        phoneNumber: this.form.controls['tel'].value,
        email: this.form.controls['email'].value,
      };
      const res = await this.userAuth.tryClaimF3Info(this.authenticatedUser, info);
      this.originalPaxResult = res;
      this.paxForDisplay = res.map((v) => v.toProperties());
      this.searched = true;

      if (res.length === 0) {
        // Error, we did not find matching data.
        this.setErrorMessage("We did not find any matching data for this information. Did you sign up under another email or phone number?");
      } else if (res.length === 1) {
        // We found a single match
        return 
      } else {
        // We found multiple matches;
        this.paxForDisplay = res;
      }
    } else {
      this.setErrorMessage("Please double check fields, they're all required.");
    }
  }

  public async claimData(paxInfo: IPaxUser) {
    if (this.authenticatedUser) {
      await this.userAuth.completeF3InfoClaim(this.authenticatedUser, paxInfo);
      alert("Your F3 Information has been claimed!");
      await this.router.navigate(['profile']);
    } else {
      throw new Error("User not logged in");
    }
  }

  private setErrorMessage(text: string) {
    this.errorMessage = text;
      setTimeout(() => {
        this.errorMessage = "";
      }, 4000);
  }
}

@Component({
  selector: 'claim-data-confirmation-dialog',
  templateUrl: 'claim-data-confirmation-dialog.component.html',
})
export class ClaimDataConfirmationDialog {

  userInput: string = '';

  constructor(
    public dialogRef: MatDialogRef<ClaimDataConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  validate() {
    let result = false;
    if (this.userInput) {
      result = this.userInput.toLowerCase() === this.data.lastName.toLowerCase();
    }
    this.dialogRef.close(result)
  }

  cancel(): void {
    this.dialogRef.close();
  }
}