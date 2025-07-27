import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SplitterModule } from 'primeng/splitter';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ContaRequestModel } from '../../../models/RequestContas';
import { ContasService } from '../../../service/contas.service';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';


interface TipoContaOption {
  name: string;
}

@Component({
  selector: 'app-cadastro-contas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SplitterModule,
    ToastModule,
    NavBarSystemComponent,
    FooterComponent,
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    DropdownModule,
    InputTextModule,
  ],
  templateUrl: './cadastro-contas.component.html',
  styleUrls: ['./cadastro-contas.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class CadastroContasComponent implements OnInit {

  requestConta!: ContaRequestModel;
  contas: any[] = [];
  tipoContaOptions: TipoContaOption[] = [];

  editDialogVisible = false;
  itemEmEdicao: any = {};
  tituloModal = 'Editar Conta';
  
  // Nova propriedade para controlar o modal de visualização de contas
  visualizarContasModalVisible = false;

  constructor(
    private contasService: ContasService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.requestConta = new ContaRequestModel();
    this.carregarContas();

    this.tipoContaOptions = [
      { name: 'Empresa' },
      { name: 'Investimento' },
      { name: 'Pessoal' },
    ];
  }

  doCadastroContas(): void {
    if (!this.requestConta.tipoConta || !this.requestConta.nomeConta) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    this.contasService.cadastrarConta(this.requestConta).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta cadastrada com sucesso!' });
        this.requestConta = new ContaRequestModel(); 
        this.carregarContas(); 
      },
      error: (err) => {
        const msg = err.error?.detail || 'Erro ao cadastrar conta';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
      }
    });
  }

  carregarContas(): void {
    this.contasService.listarContas().subscribe({
      next: (dados) => {
        this.contas = dados;
      },
      error: (err) => {
        console.error('Erro ao carregar contas:', err);
      }
    });
  }

  abrirEdicao(conta: any): void {
    this.itemEmEdicao = { ...conta };
    this.editDialogVisible = true;
  }

  salvarEdicao(): void {
    if (!this.itemEmEdicao || !this.itemEmEdicao.id) return;

    this.contasService.editarConta(this.itemEmEdicao).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta atualizada com sucesso!' });
        this.carregarContas();
        this.editDialogVisible = false;
      },
      error: (err) => {
        console.error('Erro ao editar conta:', err);
        const msg = err.error?.detail || 'Não foi possível atualizar a conta.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
      }
    });
  }

  apagarItem(conta: any): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja apagar a conta "${conta.nome_conta}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.contasService.deletarConta(conta.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta apagada com sucesso!' });
            this.carregarContas();
          },
          error: (err) => {
            console.error('Erro ao apagar conta:', err);
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível apagar a conta.' });
          }
        });
      }
    });
  }

  toggleTabelaContas(): void {
    this.carregarContas(); // Recarrega as contas antes de abrir o modal
    this.visualizarContasModalVisible = true;
  }
}