import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSystemComponent } from './main-system.component';

describe('MainSystemComponent', () => {
  let component: MainSystemComponent;
  let fixture: ComponentFixture<MainSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainSystemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
