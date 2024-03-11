import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IBeatdown } from 'src/app/models/beatdown.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { PaxManagerService } from 'src/app/services/pax-manager.service';

@Component({
  selector: 'app-beatdown-data-editor',
  templateUrl: './beatdown-data-editor.component.html',
  styleUrls: ['./beatdown-data-editor.component.scss']
})
export class BeatdownDataEditorComponent {
  @Input('createBeatdown') createBeatdown: boolean = false;
  @Input('beatdown') beatdownData!: IBeatdown;
  @Output('beatdownSaved') beatdownEventSaved: EventEmitter<IBeatdown> = new EventEmitter<IBeatdown>();
  @Output('cancel') cancel: EventEmitter<boolean> = new EventEmitter<boolean>();

  public form: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required]),
    qUser: new FormControl(''),
    specialEvent: new FormControl(''),
    aoLocation: new FormControl(''),
    coQUser:  new FormControl(''),
    eventName:  new FormControl(''),
    eventAddress:  new FormControl(''),
    additionalQs:  new FormControl(''),
  });

  constructor(
    private paxManagerService: PaxManagerService,
    private aoManagerService: AOManagerService) {
    // this.initializeForm();
  }

  // async initializeForm() {
  //   if (this.beatdownData.qUser) {
  //     const refData = await this.paxManagerService.getPaxInfoByRef(this.beatdownData.qUser);
  //     if (refData !== undefined) {
  //       this.selectedQUser = {
  //         userRef: `users/${refData.id}`, 
  //         f3Name: refData!.f3Name
  //       };
  //     }
  //   }

  //   if (this.beatdownData.aoLocation) {
  //     const refData = await this.aoManagerService.getDataByRef(this.beatdownData.aoLocation);
  //     if (refData !== undefined) {
  //       this.selectedAoLocation = {
  //         aoRef: `ao_data/${this.beatdownData.aoLocation.id}`, 
  //         name: refData.name
  //       };
  //     }
  //   }
  // }

  save() {
    if (this.form.valid) {
      // More to do here...
      this.beatdownEventSaved.emit(this.beatdownData);
    }
  }

  userCancel() {
    this.cancel.emit(true);
  }
}
