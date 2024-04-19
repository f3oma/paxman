import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IBeatdown } from 'src/app/models/beatdown.model';
import { BeatdownService } from 'src/app/services/beatdown.service';

@Component({
  selector: 'app-create-beatdown',
  templateUrl: './create-beatdown.component.html',
  styleUrls: ['./create-beatdown.component.scss']
})
export class CreateBeatdownComponent {

  public emptyBeatdown: IBeatdown;

  constructor(
    private beatdownService: BeatdownService,
    public dialogRef: MatDialogRef<CreateBeatdownComponent>) {
      const beatdown = this.beatdownService.EMPTY_BEATDOWN;
      this.emptyBeatdown = beatdown;
  }

  async saveBeatdown(beatdown: IBeatdown) {
    await this.beatdownService.createBeatdown(beatdown);
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }
}