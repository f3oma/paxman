import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimPaxInfoComponent } from './claim-pax-info.component';

describe('ClaimPaxInfoComponent', () => {
  let component: ClaimPaxInfoComponent;
  let fixture: ComponentFixture<ClaimPaxInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimPaxInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimPaxInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
