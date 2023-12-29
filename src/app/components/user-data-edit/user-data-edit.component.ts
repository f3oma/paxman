import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { BehaviorSubject, Observable, Subject, debounceTime, map } from 'rxjs';
import { PhoneNumber } from 'src/app/models/phonenumber.model';
import { IPaxUser, PaxUser } from 'src/app/models/users.model';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { PaxSearchService } from 'src/app/services/pax-search.service';

@Component({
  selector: 'user-data-edit',
  templateUrl: './user-data-edit.component.html',
  styleUrls: ['./user-data-edit.component.scss']
})
export class UserDataEditComponent {

  @Input('user') user!: IPaxUser;
  @Output('userSaved') userSavedEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('userCanceled') userCanceledEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  public form: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    tel: new FormControl(new PhoneNumber('', '', '')),
    email: new FormControl('', [Validators.required, Validators.email]),
    hideContactInformation: new FormControl(''),
    activeUser: new FormControl(''),
    sector: new FormControl(''),
    ehByF3Name: new FormControl(''),
    zipcode: new FormControl(''),
    notifications: new FormControl('')
  });

  filteredEhF3OptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredEhF3Options$: Observable<any[]> = this.filteredEhF3OptionsSubject.asObservable();
  selectedEhName: Object | undefined = undefined;

  constructor(private paxManagerService: PaxManagerService, private paxSearchService: PaxSearchService) {
    this.form.controls['ehByF3Name'].valueChanges.pipe(
      debounceTime(1000),
      map(async (value: string) => {
        if (value) {
          await this.updateAutocompleteResults(value);
        }
        return [];
      })).subscribe();
  }

  async ngOnInit() {
    if (this.user.ehByUserRef) {
      const refData = await this.paxManagerService.getPaxInfoByRef(this.user.ehByUserRef);
      if (refData !== undefined) {
        this.selectedEhName = {
          userRef: `users/${refData.id}`, 
          f3Name: refData!.f3Name
        }
      }
    }
  }

  public getEmailErrorMessage(): string {
    if (this.form.controls['email'].hasError('required')) {
        return 'You must enter a value';
    }
    return this.form.controls['email'].hasError('email') ? 'Not a valid email' : '';
  }

  public displayF3NameOptions(option: any) {
    if (!option) {
      return '';
    }
    return option.f3Name;
  }

  public async saveData(user: IPaxUser) {
    await this.paxManagerService.updateUser(user);
    this.userSavedEmitter.emit(true);
  }

  public cancel() {
    this.userCanceledEmitter.emit(true);
  }

  public updateHideContactInfoValue($event: MatCheckboxChange, user: IPaxUser) {
      user.hideContactInformation = $event.checked;
  }

  public updateActiveStatusValue($event: MatCheckboxChange, user: IPaxUser) {
      user.activeUser = $event.checked;
  }

  private async updateAutocompleteResults(partialF3Name: string): Promise<void> {
    const result = await this.paxSearchService.findF3Name(partialF3Name);
    const pax = result.map((res) => {
      return { 
        userRef: res.path, 
        f3Name: res.f3Name 
      };
    })
    this.filteredEhF3OptionsSubject.next(pax);
  }
}
