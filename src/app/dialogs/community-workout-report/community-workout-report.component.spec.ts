import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityWorkoutReportComponent } from './community-workout-report.component';

describe('CommunityWorkoutReportComponent', () => {
  let component: CommunityWorkoutReportComponent;
  let fixture: ComponentFixture<CommunityWorkoutReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommunityWorkoutReportComponent]
    });
    fixture = TestBed.createComponent(CommunityWorkoutReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
