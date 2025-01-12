import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { ExiconEditDialog } from 'src/app/dialogs/exicon-edit/exicon-edit-dialog.component';
import { Exercise } from 'src/app/models/exercise.model';
import { ExiconService } from 'src/app/services/exicon.service';

@Component({
  selector: 'app-exicon-approval',
  templateUrl: './exicon-approval.component.html',
  styleUrls: ['./exicon-approval.component.scss']
})
export class ExiconApprovalComponent implements OnInit {

  private exerciseSubject: BehaviorSubject<Exercise[]> = new BehaviorSubject<Exercise[]>([]);
  public exercises$: Observable<Exercise[]> = this.exerciseSubject.asObservable();

  constructor(private exiconService: ExiconService, private matDialog: MatDialog) {}

  async ngOnInit() {
    await this.getUnapprovedExercises();
  }

  async getUnapprovedExercises() {
    const exercises = await this.exiconService.getUnapprovedExercises();
    this.exerciseSubject.next(exercises);
  }

  async approve(exercise: Exercise) {
    await this.exiconService.markExerciseApproved(exercise);
    await this.getUnapprovedExercises();
  }

  async deny(exercise: Exercise) {
    await this.exiconService.deleteExercise(exercise);
    await this.getUnapprovedExercises();
  }

  async edit(exercise: Exercise) {
    const dialog = this.matDialog.open(ExiconEditDialog, {
      data: exercise
    });
    dialog.afterClosed().subscribe(async (res) => {
      if (res) {
        exercise.description = res.description;
        exercise.name = res.name;
        await this.exiconService.updateExercise(exercise);
      }
    })
  }
}
