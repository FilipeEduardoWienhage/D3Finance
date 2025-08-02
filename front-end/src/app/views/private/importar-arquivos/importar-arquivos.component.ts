import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { FileUpload, FileUploadEvent } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-importar-arquivos',
  imports: [
    FooterComponent, 
    NavBarSystemComponent,
    FileUpload,
    ToastModule,
    CommonModule,
    SplitterModule,
    DividerModule,
    ButtonModule,
    DialogModule,
  ],
  templateUrl: './importar-arquivos.component.html',
  styleUrl: './importar-arquivos.component.css',
  providers: [MessageService]
})
export class ImportarArquivosComponent {
  uploadedFiles: any[] = [];
  showHelpModal: boolean = false;

  constructor(
    private messageService: MessageService,
    private router: Router
  ) {}

  onUpload(event: FileUploadEvent) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Arquivo carregado',
      detail: 'Arquivo carregado com sucesso!',
    });
  }

  downloadTemplate() {
    const csvContent = `tipo,conta_nome,categoria,valor,data,forma,descricao
receita,Nubank,Salário,5000.00,2024-01-15,PIX,Salário mensal
despesa,Nubank,Alimentação,150.00,2024-01-16,Cartão de Crédito,Supermercado
despesa,Nubank,Transporte,50.00,2024-01-17,Dinheiro,Combustível`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_importacao.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.messageService.add({
      severity: 'success',
      summary: 'Template baixado',
      detail: 'Template CSV baixado com sucesso!',
    });
  }
}
