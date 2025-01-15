import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThirdFComponent } from './third-f.component';

describe('ThirdFComponent', () => {
  let component: ThirdFComponent;
  let fixture: ComponentFixture<ThirdFComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThirdFComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ThirdFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
