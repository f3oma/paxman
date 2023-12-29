import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDataViewComponent } from './user-data-view.component';

describe('UserDataViewComponent', () => {
  let component: UserDataViewComponent;
  let fixture: ComponentFixture<UserDataViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserDataViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDataViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
