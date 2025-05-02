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


interface tipoConta {
  name: string;
}


@Component({
  selector: 'app-cadastro-contas',
  imports: [SplitterModule, NavBarSystemComponent, FooterComponent, CardModule, SelectModule, FormsModule, ButtonModule],
  templateUrl: './cadastro-contas.component.html',
  styleUrl: './cadastro-contas.component.css',
  providers: [
    MessageService,
  ]
})
export class CadastroContasComponent {
  public requestConta!: ContaRequestModel;

  constructor(private contasService: ContasService) {}

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
      next: () => alert("Conta cadastrada com sucesso!"),
      error: erro => {
        console.error(erro)
        alert("Erro ao efetuar o cadastro!");
      }
    });
  }
}
