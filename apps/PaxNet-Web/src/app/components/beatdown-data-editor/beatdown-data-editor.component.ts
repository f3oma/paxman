import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged, first, fromEvent, map, switchMap } from 'rxjs';
import { AOData } from 'src/app/models/ao.model';
import { IBeatdown } from 'src/app/models/beatdown.model';
import { PaxUser } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { LocationSearchService } from 'src/app/services/location-search.service';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { PaxSearchService } from 'src/app/services/pax-search.service';

interface QUserData {
  userRef: string, 
  f3Name: string
}

interface AOLocationData {
  aoRef: string, 
  name: string
}

@Component({
  selector: 'app-beatdown-data-editor',
  templateUrl: './beatdown-data-editor.component.html',
  styleUrls: ['./beatdown-data-editor.component.scss']
})
export class BeatdownDataEditorComponent implements OnInit, AfterViewInit {
  @Input('createBeatdown') createBeatdown: boolean = false;
  @Input('beatdown') beatdown!: IBeatdown;
  @Input('userIsAdmin') userIsAdmin: boolean = false;
  @Output('beatdownDeleted') beatdownEventDeleted: EventEmitter<IBeatdown> = new EventEmitter<IBeatdown>();
  @Output('beatdownSaved') beatdownEventSaved: EventEmitter<IBeatdown> = new EventEmitter<IBeatdown>();
  @Output('cancel') cancel: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('primaryQ') primaryQInput: ElementRef | null = null;
  @ViewChild('coQ') coQInput: ElementRef | null = null;
  @ViewChild('additionalQsInput') additionalQsInput!: ElementRef<HTMLInputElement>;
  @ViewChild('aoLocation') locationInput: ElementRef | null = null;

  showAddressField = false;
  showEventNameField = false;

  filteredF3OptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredF3Options$: Observable<any[]> = this.filteredF3OptionsSubject.asObservable();
  selectedByF3Name: any = '';

  filteredCoQOptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredCoQOptions$: Observable<any[]> = this.filteredCoQOptionsSubject.asObservable();
  selectedCoQByF3Name: any = '';

  filteredLocationOptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredLocationOptions$: Observable<any[]> = this.filteredLocationOptionsSubject.asObservable();
  selectedLocation: any = '';

  filteredAdditionalQsOptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredAdditionalQsOptions$: Observable<any[]> = this.filteredAdditionalQsOptionsSubject.asObservable();

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  public form: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required]),
    qUser: new FormControl(''),
    specialEvent: new FormControl(''),
    aoLocation: new FormControl(''),
    coQUser:  new FormControl(''),
    eventName:  new FormControl(''),
    eventAddress:  new FormControl(''),
    additionalQs:  new FormControl(''),
    canceled: new FormControl(''),
    startTime: new FormControl(''),
    notes: new FormControl(''),
  });

  temporaryAdditionalQs: QUserData[] = [];
  selectedAoRef: AOLocationData | null = null;

  originalAdditionalQs: QUserData[] = [];

  constructor(
    private readonly paxSearchService: PaxSearchService,
    private readonly paxManagerService: PaxManagerService,
    private readonly locationSearchService: LocationSearchService,
    private aoManagerService: AOManagerService) {
  }

  public ngOnInit(): void {
    if (this.beatdown.aoLocation?.rotating || this.beatdown.aoLocation?.popup) {
      this.showAddressField = true;
    }
    if (this.beatdown.additionalQs) {
      for(let q of this.beatdown.additionalQs) {
        if (!q) {
          continue;
        }
        this.temporaryAdditionalQs.push({
          userRef: 'users/' + q.id,
          f3Name: q.f3Name,
        })
      }
      this.originalAdditionalQs = JSON.parse(JSON.stringify(this.temporaryAdditionalQs));
    }
  }

  public ngAfterViewInit() {
    this.initializeForm();
    this.form.controls['additionalQs'].valueChanges.pipe(
      debounceTime(200),
      map(async (value: string) => {
        if (value) {
          await this.updateUserAutocompleteResults(value, this.filteredAdditionalQsOptionsSubject);
        }
        return [];
      })).subscribe();

    fromEvent<InputEvent>(this.primaryQInput?.nativeElement, 'input').pipe(
      debounceTime(500),
      map(async (event: InputEvent) => {
        const target = event.target as HTMLInputElement;
        if (target.value) {
          await this.updateUserAutocompleteResults(target.value, this.filteredF3OptionsSubject);
        }
        if (target.value === '') {
          this.form.controls['qUser'].setValue(null);
        }
        return [];
      })).subscribe();

      fromEvent<InputEvent>(this.coQInput?.nativeElement, 'input').pipe(
        debounceTime(500),
        map(async (event: InputEvent) => {
          const target = event.target as HTMLInputElement;
          if (target.value) {
            await this.updateUserAutocompleteResults(target.value, this.filteredCoQOptionsSubject);
          }
          if (target.value === '') {
            this.form.controls['coQUser'].setValue(null);
          }
          return [];
        })).subscribe();

      fromEvent<InputEvent>(this.locationInput?.nativeElement, 'keydown').pipe(
        debounceTime(500),
        map(async (event: InputEvent) => {
          const target = event.target as HTMLInputElement;
          if (target.value) {
            await this.updateLocationAutocompleteResults(target.value);
          }
          return [];
        })).subscribe();
  }

  async initializeForm() {
    if (this.beatdown.qUser) {
      const data = this.beatdown.qUser
      if (data !== undefined) {
        const qUser = {
          userRef: `users/${data.id}`, 
          f3Name: data.f3Name
        };
        this.form.controls['qUser'].setValue(qUser)
      }
    }

    if (this.beatdown.coQUser) {
      const refData = this.beatdown.coQUser
      if (refData !== undefined) {
        const coQUser = {
          userRef: `users/${refData.id}`, 
          f3Name: refData!.f3Name
        };
        this.form.controls['coQUser'].setValue(coQUser)
      }
    }

    // Add additional users
    if (this.beatdown.aoLocation) {
      if (!this.beatdown.startTime && this.beatdown.aoLocation.startTimeCST) {
        this.form.controls['startTime'].setValue(this.beatdown.aoLocation.startTimeCST);
      }
      const refData = this.beatdown.aoLocation;
      if (refData !== undefined) {
        this.form.controls['aoLocation'].setValue({
          aoRef: this.beatdown.aoLocation.id, 
          name: refData.name
        })
      }
    }
  }

  removeAdditionalQ(siteQ: QUserData): void {
    this.temporaryAdditionalQs = this.temporaryAdditionalQs.filter((a) => a.userRef !== siteQ.userRef);
  }

  specialEventChanged(event: any) {
      // Value is an array of selected values such as ['available', 'VQ']
      const { value } = event;
  
      if (value.includes('Popup')) {
        this.showAddressField = true;
        this.showEventNameField = true;
        return;
      }

      if (value.includes('CommunityEvent')) {
        this.showAddressField = true;
        this.showEventNameField = true;
        return;
      }

      this.showAddressField = false;
      this.showEventNameField = false;
  }

  async save() {
    if (this.form.valid) {

      if (this.form.controls['eventName'].value) {
        this.beatdown.eventName = this.form.controls['eventName'].value;
      }

      if (this.form.controls['eventAddress'].value) {
        this.beatdown.eventAddress = this.form.controls['eventAddress'].value;
      }

      if (this.form.controls['qUser'].value) {
        const userRef = this.paxManagerService.getUserReference(this.form.controls['qUser'].value.userRef) as DocumentReference<PaxUser>;
        const userData = await this.paxManagerService.getPaxInfoByRef(userRef);
        this.beatdown.qUser = userData;
      } else {
        this.beatdown.qUser = undefined;
      }

      if (this.form.controls['coQUser'].value) {
        const userRef = this.paxManagerService.getUserReference(this.form.controls['coQUser'].value.userRef) as DocumentReference<PaxUser>;
        const userData = await this.paxManagerService.getPaxInfoByRef(userRef);
        this.beatdown.coQUser = userData;
      } else {
        this.beatdown.coQUser = undefined;
      }

      const additionalQs = [];
      for (let user of this.temporaryAdditionalQs) {
        const userRef = this.paxManagerService.getUserReference(user.userRef);
        const userData = await this.paxManagerService.getPaxInfoByRef(userRef);
        additionalQs.push(userData);
      }
      this.beatdown.additionalQs = additionalQs;

      if (this.form.controls['aoLocation'].value) {
        const locationRef = this.aoManagerService.getAoLocationReference(this.form.controls['aoLocation'].value.aoRef) as DocumentReference<AOData>;
        const aoData = await this.aoManagerService.getDataByRef(locationRef);
        this.beatdown.aoLocation = aoData;
      } else {
          this.beatdown.aoLocation = null;
      }

      // Reset hours for beatdown
      this.beatdown.date.setHours(0, 0, 0, 0);

      this.beatdownEventSaved.emit(this.beatdown);
    }
  }

  public updateCanceledValue($event: MatCheckboxChange, beatdown: IBeatdown) {
    beatdown.canceled = $event.checked;
  }

  addAdditionalQs(event: any): void {
    const option = event.option.value;
    this.temporaryAdditionalQs.push(option);
    this.additionalQsInput.nativeElement.value = '';
  }

  userCancel() {
    this.cancel.emit(true);
  }

  deleteBeatdown() {
    this.beatdownEventDeleted.emit(this.beatdown);
  }

  public displayF3NameOptions(option: any) {
    return option?.f3Name;
  }

  public displayLocationNameOptions(option: any) {
    return option?.name;
  }

  private async updateUserAutocompleteResults(partialF3Name: string, subject: Subject<any[]>): Promise<void> {
    const result = await this.findEhF3Name(partialF3Name);
    const pax = result.map((res) => {
      return { 
        userRef: res.path, 
        f3Name: res.f3Name ,
        fullName: res.firstName + ' ' + res.lastName
      };
    })
    subject.next(pax);
  }

  private async updateLocationAutocompleteResults(partialLocationName: string): Promise<void> {
    const result = await this.findLocationByName(partialLocationName);
    const locations = result.map((res) => {
      return { 
        aoRef: res.path, 
        name: res.name 
      };
    })
    this.filteredLocationOptionsSubject.next(locations);
  }

  private async findEhF3Name(partialF3Name: string): Promise<any[]> {
    return await this.paxSearchService.findF3Name(partialF3Name);
  }

  private async findLocationByName(partialLocationName: string): Promise<any[]> {
    return await this.locationSearchService.findByName(partialLocationName);
  }
}
