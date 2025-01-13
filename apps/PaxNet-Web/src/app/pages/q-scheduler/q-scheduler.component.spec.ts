import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QSchedulerComponent } from './q-scheduler.component';

describe('QSchedulerComponent', () => {
  let component: QSchedulerComponent;
  let fixture: ComponentFixture<QSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QSchedulerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
