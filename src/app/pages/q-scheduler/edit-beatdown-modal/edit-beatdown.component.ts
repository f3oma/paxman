import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Beatdown, IBeatdown } from 'src/app/models/beatdown.model';
import { BeatdownService } from 'src/app/services/beatdown.service';

export interface EditBeatdownProps {
  beatdown: Beatdown;
  userIsAdmin: boolean;
}

@Component({
  selector: 'app-edit-beatdown',
  templateUrl: './edit-beatdown.component.html',
  styleUrls: ['./edit-beatdown.component.scss']
})
export class EditBeatdownComponent {

  public beatdown: IBeatdown;
  public userIsAdmin: boolean = false;

  constructor(
    private beatdownService: BeatdownService,
    public dialogRef: MatDialogRef<EditBeatdownComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditBeatdownProps) {
      const beatdown = data.beatdown;
      this.userIsAdmin = data.userIsAdmin;
      this.beatdown = beatdown.toProperties();
  }

  async saveBeatdown(beatdown: IBeatdown) {
    await this.beatdownService.updateBeatdown(beatdown);
    this.dialogRef.close(beatdown);
  }

  async deleteBeatdown(beatdown: IBeatdown) {
    if (this.userIsAdmin) {
      await this.beatdownService.deleteBeatdownById(beatdown.id);
      this.dialogRef.close();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
