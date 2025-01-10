import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExiconApprovalComponent } from './exicon-approval.component';

describe('ExiconApprovalComponent', () => {
  let component: ExiconApprovalComponent;
  let fixture: ComponentFixture<ExiconApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExiconApprovalComponent]
    });
    fixture = TestBed.createComponent(ExiconApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
