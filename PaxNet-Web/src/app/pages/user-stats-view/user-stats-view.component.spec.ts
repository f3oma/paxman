import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStatsViewComponent } from './user-stats-view.component';

describe('UserStatsViewComponent', () => {
  let component: UserStatsViewComponent;
  let fixture: ComponentFixture<UserStatsViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserStatsViewComponent]
    });
    fixture = TestBed.createComponent(UserStatsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
