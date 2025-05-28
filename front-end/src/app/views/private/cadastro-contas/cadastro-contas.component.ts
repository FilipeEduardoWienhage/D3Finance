import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ContaRequestModel } from '../../../models/RequestContas';
import { ContasService } from '../../../service/contas.service';
import { Toast, ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { TabMenuModule } from 'primeng/tabmenu';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InplaceModule } from 'primeng/inplace';


interface tipoConta {
  name: string;
}


@Component({
  selector: 'app-cadastro-contas',
  imports: 
  [
  SplitterModule,
  ToastModule,
  NavBarSystemComponent,
  FooterComponent,
  CardModule,
  SelectModule,
  FormsModule,
  ButtonModule,
  CommonModule,
  SplitterModule,
  TabMenuModule,
  ToastModule,
  DialogModule,
  TableModule,
  InplaceModule,
  ],
  templateUrl: './cadastro-contas.component.html',
  styleUrl: './cadastro-contas.component.css',
  providers: [
    MessageService,
  ]
})
export class CadastroContasComponent {
  public requestConta!: ContaRequestModel;
  constructor(
    private contasService: ContasService,
    private messageService: MessageService,
  ) {}
  mostrarTabelaContas = false;

  tipoConta: tipoConta[] | undefined;
  selecionarTipoConta: tipoConta | undefined;

  saldo: any[] = [];
  conta: any[] = [];


  ngOnInit(): void {
    this.carregarContas();
    this.requestConta = new ContaRequestModel();

    
    this.tipoConta = [
      { name: 'Pessoal' },
      { name: 'Empresa' },
      { name: 'Despesas' },
    ];
  }

  public doCadastroContas(): void {
    console.log(this.requestConta);
    this.contasService.cadastrarConta(this.requestConta).subscribe({
      next: () => {
        this.requestConta = { tipoConta: '', nomeConta: '' };
        this.carregarContas();

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Conta cadastrada com sucesso!',
        });

        this.requestConta = {
          tipoConta: '',
          nomeConta: ''
        };
      },
      error: (err) => {
        const msg = err.error?.detail || 'Erro ao cadastrar conta';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: msg,
        });
      }
    });
  }

  carregarContas(): void {
    this.contasService.listarContas().subscribe({
      next: (dados) => {
        this.conta = dados;
      },
      error: (err) => {
        console.error('Erro ao carregar contas:', err);
      }
    });
  }

  
}

