import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPaxComponent } from './add-pax.component';

describe('AddPaxComponent', () => {
  let component: AddPaxComponent;
  let fixture: ComponentFixture<AddPaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPaxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
