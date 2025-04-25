import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { FileUpload, FileUploadEvent } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-importar-arquivos',
  imports: [
    FooterComponent, 
    NavBarSystemComponent,
    FileUpload,
    ToastModule,
    CommonModule
  ],
  templateUrl: './importar-arquivos.component.html',
  styleUrl: './importar-arquivos.component.css',
  providers: [MessageService]
})
export class ImportarArquivosComponent {
  uploadedFiles: any[] = [];

  constructor(private messageService: MessageService) {}

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
}
