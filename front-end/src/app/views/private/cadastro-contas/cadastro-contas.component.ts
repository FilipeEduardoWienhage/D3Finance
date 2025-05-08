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
import { ToastModule } from 'primeng/toast';


interface tipoConta {
  name: string;
}


@Component({
  selector: 'app-cadastro-contas',
  imports: [
  SplitterModule,
  ToastModule,
  NavBarSystemComponent,
  FooterComponent,
  CardModule,
  SelectModule,
  FormsModule,
  ButtonModule,
  ],
  templateUrl: './cadastro-contas.component.html',
  styleUrl: './cadastro-contas.component.css',
  providers: [
    MessageService,
  ]
})
export class CadastroContasComponent {
  public requestConta!: ContaRequestModel;

  constructor(private contasService: ContasService,private messageService: MessageService) {}

  tipoConta: tipoConta[] | undefined;
  selecionarTipoConta: tipoConta | undefined;

  ngOnInit(): void {
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
}

