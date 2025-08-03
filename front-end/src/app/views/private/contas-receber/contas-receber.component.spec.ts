import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContasReceberComponent } from './contas-receber.component';

describe('ContasReceberComponent', () => {
  let component: ContasReceberComponent;
  let fixture: ComponentFixture<ContasReceberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContasReceberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContasReceberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
