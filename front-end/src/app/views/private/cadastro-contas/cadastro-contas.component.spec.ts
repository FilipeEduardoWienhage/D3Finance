import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroContasComponent } from './cadastro-contas.component';

describe('CadastroContasComponent', () => {
  let component: CadastroContasComponent;
  let fixture: ComponentFixture<CadastroContasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroContasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroContasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
