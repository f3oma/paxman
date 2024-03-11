import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeatdownDataEditorComponent } from './beatdown-data-editor.component';

describe('BeatdownDataEditorComponent', () => {
  let component: BeatdownDataEditorComponent;
  let fixture: ComponentFixture<BeatdownDataEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BeatdownDataEditorComponent]
    });
    fixture = TestBed.createComponent(BeatdownDataEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
