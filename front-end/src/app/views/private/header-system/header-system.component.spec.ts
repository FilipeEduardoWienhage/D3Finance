import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSystemComponent } from './header-system.component';

describe('HeaderSystemComponent', () => {
  let component: HeaderSystemComponent;
  let fixture: ComponentFixture<HeaderSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderSystemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
