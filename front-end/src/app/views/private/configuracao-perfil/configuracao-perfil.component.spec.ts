import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracaoPerfilComponent } from './configuracao-perfil.component';

describe('ConfiguracaoPerfilComponent', () => {
  let component: ConfiguracaoPerfilComponent;
  let fixture: ComponentFixture<ConfiguracaoPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracaoPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracaoPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
