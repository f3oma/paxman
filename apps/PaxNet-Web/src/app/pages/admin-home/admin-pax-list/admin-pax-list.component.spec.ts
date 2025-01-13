import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPaxListComponent } from './admin-pax-list.component';

describe('AdminPaxListComponent', () => {
  let component: AdminPaxListComponent;
  let fixture: ComponentFixture<AdminPaxListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPaxListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPaxListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
