import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IBeatdown } from 'src/app/models/beatdown.model';
import { BeatdownService } from 'src/app/services/beatdown.service';

export interface CreateBeatdownProps {
  userIsAdmin: boolean;
}

@Component({
  selector: 'app-create-beatdown',
  templateUrl: './create-beatdown.component.html',
  styleUrls: ['./create-beatdown.component.scss']
})
export class CreateBeatdownComponent {

  public emptyBeatdown: IBeatdown;
  public userIsAdmin: boolean = false;

  constructor(
    private beatdownService: BeatdownService,
    public dialogRef: MatDialogRef<CreateBeatdownComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateBeatdownProps) {
      const beatdown = this.beatdownService.EMPTY_BEATDOWN;
      this.userIsAdmin = data.userIsAdmin;
      this.emptyBeatdown = beatdown;
  }

  async saveBeatdown(beatdown: IBeatdown) {
    await this.beatdownService.createBeatdown(beatdown);
    this.dialogRef.close();
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