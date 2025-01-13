import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogWorkoutComponent } from './log-workout.component';

describe('LogWorkoutComponent', () => {
  let component: LogWorkoutComponent;
  let fixture: ComponentFixture<LogWorkoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogWorkoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogWorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
