import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarSystemComponent } from './nav-bar-system.component';

describe('NavBarSystemComponent', () => {
  let component: NavBarSystemComponent;
  let fixture: ComponentFixture<NavBarSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBarSystemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavBarSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
