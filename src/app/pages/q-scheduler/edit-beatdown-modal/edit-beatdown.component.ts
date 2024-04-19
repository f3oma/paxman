import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Beatdown, IBeatdown } from 'src/app/models/beatdown.model';
import { BeatdownService } from 'src/app/services/beatdown.service';

@Component({
  selector: 'app-edit-beatdown',
  templateUrl: './edit-beatdown.component.html',
  styleUrls: ['./edit-beatdown.component.scss']
})
export class EditBeatdownComponent {

  public beatdown: IBeatdown;

  constructor(
    private beatdownService: BeatdownService,
    public dialogRef: MatDialogRef<EditBeatdownComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Beatdown) {
      const beatdown = data;
      this.beatdown = beatdown.toProperties();
  }

  async saveBeatdown(beatdown: IBeatdown) {
    await this.beatdownService.updateBeatdown(beatdown);
    this.dialogRef.close(beatdown);
  }

  cancel() {
    this.dialogRef.close();
  }
}
