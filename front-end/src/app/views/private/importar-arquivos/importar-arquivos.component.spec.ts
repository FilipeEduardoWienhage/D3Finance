import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportarArquivosComponent } from './importar-arquivos.component';

describe('ImportarArquivosComponent', () => {
  let component: ImportarArquivosComponent;
  let fixture: ComponentFixture<ImportarArquivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportarArquivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportarArquivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
