import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimentacaoEntreContasComponent } from './movimentacao-entre-contas.component';

describe('MovimentacaoEntreContasComponent', () => {
  let component: MovimentacaoEntreContasComponent;
  let fixture: ComponentFixture<MovimentacaoEntreContasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovimentacaoEntreContasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovimentacaoEntreContasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
