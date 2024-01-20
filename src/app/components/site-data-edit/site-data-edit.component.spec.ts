import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteDataEditComponent } from './site-data-edit.component';

describe('SiteDataEditComponent', () => {
  let component: SiteDataEditComponent;
  let fixture: ComponentFixture<SiteDataEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteDataEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteDataEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
