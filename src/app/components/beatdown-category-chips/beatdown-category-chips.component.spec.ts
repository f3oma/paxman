import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeatdownCategoryChipsComponent } from './beatdown-category-chips.component';

describe('BeatdownCategoryChipsComponent', () => {
  let component: BeatdownCategoryChipsComponent;
  let fixture: ComponentFixture<BeatdownCategoryChipsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BeatdownCategoryChipsComponent]
    });
    fixture = TestBed.createComponent(BeatdownCategoryChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
