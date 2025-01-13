import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBeatdownComponent } from './create-beatdown.component';

describe('CreateBeatdownComponent', () => {
  let component: CreateBeatdownComponent;
  let fixture: ComponentFixture<CreateBeatdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateBeatdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBeatdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
