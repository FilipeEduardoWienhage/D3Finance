import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContasPagarComponent } from './contas-pagar.component';

describe('ContasPagarComponent', () => {
  let component: ContasPagarComponent;
  let fixture: ComponentFixture<ContasPagarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContasPagarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContasPagarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
