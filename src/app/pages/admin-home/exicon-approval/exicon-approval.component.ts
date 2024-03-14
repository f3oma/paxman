import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

  constructor(private exiconService: ExiconService) {}

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
}
