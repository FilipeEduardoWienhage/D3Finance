import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcadoRealizadoComponent } from './orcado-realizado.component';

describe('OrcadoRealizadoComponent', () => {
  let component: OrcadoRealizadoComponent;
  let fixture: ComponentFixture<OrcadoRealizadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcadoRealizadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrcadoRealizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

