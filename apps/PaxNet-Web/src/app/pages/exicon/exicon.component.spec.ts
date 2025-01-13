import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExiconComponent } from './exicon.component';

describe('ExiconComponent', () => {
  let component: ExiconComponent;
  let fixture: ComponentFixture<ExiconComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExiconComponent]
    });
    fixture = TestBed.createComponent(ExiconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
