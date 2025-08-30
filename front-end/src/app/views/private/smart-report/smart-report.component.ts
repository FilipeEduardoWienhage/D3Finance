import { Component, inject, OnInit } from '@angular/core';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { SplitterModule } from 'primeng/splitter';
import { HeaderSystemComponent } from "../header-system/header-system.component";
import { EditorModule } from 'primeng/editor';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

interface RelatorioModelo {
  name: string;
  code: string;
}

@Component({
  selector: 'app-smart-report',
  imports: [
    NavBarSystemComponent,
    FooterComponent,
    ToastModule,
    SplitterModule,
    HeaderSystemComponent,
    EditorModule,
    FormsModule,
    MessageModule,
    ButtonModule,
    CardModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    CommonModule,
  ],
  templateUrl: './smart-report.component.html',
  styleUrl: './smart-report.component.css',
  providers: [MessageService]
})
export class SmartReportComponent implements OnInit {

  text: string | undefined;
  
  // Modelos de relatório disponíveis
  modelosRelatorios: RelatorioModelo[] | undefined;
  modeloSelecionado: RelatorioModelo | undefined;
  

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.inicializarModelos();
  }

  private inicializarModelos() {
    this.modelosRelatorios = [
      { name: 'Relatório Mensal', code: 'mensal' },
      { name: 'Relatório Anual', code: 'anual' }
    ];
    
    // Inicialmente nenhum modelo selecionado
    this.modeloSelecionado = undefined;
  }

  onModeloChange() {
    // Lógica será implementada posteriormente
    console.log('Modelo selecionado:', this.modeloSelecionado);
  }

  gerarRelatorioAutomatico() {
    // Lógica será implementada posteriormente
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Funcionalidade será implementada em breve'
    });
  }

  removerRelatorio() {
    this.text = '';
    this.modeloSelecionado = undefined;
  }

  salvarRelatorio() {
    if (!this.text) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Gere um relatório antes de salvar'
      });
      return;
    }

    // Implementar lógica de salvamento
    console.log('Relatório salvo:', this.text);
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Relatório salvo com sucesso!'
    });
  }

  imprimirRelatorio() {
    if (!this.text) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Gere um relatório antes de imprimir'
      });
      return;
    }

    // Implementar lógica de impressão
    window.print();
  }
}

