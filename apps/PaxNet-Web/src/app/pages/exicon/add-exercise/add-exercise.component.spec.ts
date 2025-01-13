import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExerciseComponent } from './add-exercise.component';

describe('AddExerciseComponent', () => {
  let component: AddExerciseComponent;
  let fixture: ComponentFixture<AddExerciseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExerciseComponent]
    });
    fixture = TestBed.createComponent(AddExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
