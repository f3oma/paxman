import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBeatdownComponent } from './edit-beatdown.component';

describe('EditBeatdownComponent', () => {
  let component: EditBeatdownComponent;
  let fixture: ComponentFixture<EditBeatdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBeatdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBeatdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
