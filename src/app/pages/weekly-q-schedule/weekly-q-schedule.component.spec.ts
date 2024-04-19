import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyQScheduleComponent } from './weekly-q-schedule.component';

describe('WeeklyQScheduleComponent', () => {
  let component: WeeklyQScheduleComponent;
  let fixture: ComponentFixture<WeeklyQScheduleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WeeklyQScheduleComponent]
    });
    fixture = TestBed.createComponent(WeeklyQScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
