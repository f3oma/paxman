import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalWorkoutReportComponent } from './personal-workout-report.component';

describe('PersonalWorkoutReportComponent', () => {
  let component: PersonalWorkoutReportComponent;
  let fixture: ComponentFixture<PersonalWorkoutReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalWorkoutReportComponent]
    });
    fixture = TestBed.createComponent(PersonalWorkoutReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
