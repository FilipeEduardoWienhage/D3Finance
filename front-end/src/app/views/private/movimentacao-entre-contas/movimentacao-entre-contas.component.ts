import { Component } from '@angular/core';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { SplitterModule } from 'primeng/splitter';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Fluid } from 'primeng/fluid';
import { SelectModule } from 'primeng/select';
import { ContasService } from '../../../service/contas.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TransacaoService } from '../../../service/transacao.service';
import { TransacaoRequestModel } from '../../../models/RequestTransacao';
import { ToastModule } from 'primeng/toast';



interface Conta {
  id: number;
  name: string;
}

@Component({
  selector: 'app-movimentacao-entre-contas',
  imports: [NavBarSystemComponent,
    ToastModule,
    FooterComponent,
    FormsModule,
    SplitterModule,
    DividerModule,
    InputNumber,
    Fluid,
    SelectModule,
    CardModule,
    ButtonModule],
  templateUrl: './movimentacao-entre-contas.component.html',
  styleUrl: './movimentacao-entre-contas.component.css',
  providers: [
    MessageService
  ]
})
export class MovimentacaoEntreContasComponent {

  transacao: TransacaoRequestModel = new TransacaoRequestModel();
  contas: Conta[] = [];

  constructor(
    private contasService: ContasService,
    private transacaoService: TransacaoService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.contasService.listarContas().subscribe({
      next: (contas) => {
        this.contas = contas
          .map(conta => ({
            id: conta.id,
            name: conta.nome_conta
          }))
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      },
      error: (erro) => console.error('Erro ao carregar contas:', erro)
    });
  }

  doMovimentarContas(): void {
    // VALIDAÇÃO: Verificar se conta origem e destino são diferentes
    if (this.transacao.conta_origem_id === this.transacao.conta_destino_id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'A conta origem e a conta destino não podem ser a mesma.'
      });
      return; // Para a execução aqui
    }

    // VALIDAÇÃO: Verificar se os campos obrigatórios estão preenchidos
    if (!this.transacao.conta_origem_id || !this.transacao.conta_destino_id || !this.transacao.valor) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios.'
      });
      return;
    }

    // VALIDAÇÃO: Verificar se o valor é maior que zero
    if (this.transacao.valor <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'O valor deve ser maior que zero.'
      });
      return;
    }

    // Se passou por todas as validações, continua com a transação
    this.transacaoService.cadastrarTransacao(this.transacao).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Transação realizada com sucesso!'
        });
        this.limparFormulario();
      },
      error: (erro) => {
        console.error('Erro ao movimentar contas:', erro);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao realizar movimentação. Tente novamente.'
        });
      }
    });
  }

  limparFormulario(): void {
    this.transacao = new TransacaoRequestModel();
  }
}