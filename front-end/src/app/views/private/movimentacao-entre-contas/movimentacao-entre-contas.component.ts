import { Component } from '@angular/core';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { SplitterModule } from 'primeng/splitter';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { InputNumber } from 'primeng/inputnumber';
import { Fluid } from 'primeng/fluid';
import { SelectModule } from 'primeng/select';
import { ContasService } from '../../../service/contas.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Password } from 'primeng/password';


interface contaDestino {
  id: number;
  name: string;
}

@Component({
  selector: 'app-movimentacao-entre-contas',
  imports: [NavBarSystemComponent, FooterComponent, SplitterModule, DividerModule, InputNumber, Fluid, SelectModule, CardModule, ButtonModule],
  templateUrl: './movimentacao-entre-contas.component.html',
  styleUrl: './movimentacao-entre-contas.component.css',
  providers: [
    MessageService
  ]
})
export class MovimentacaoEntreContasComponent {

  constructor(private contasService: ContasService) { }

  valorDestino: number = 0;
  valorOrigem: number = 0;
  contaDestino: contaDestino[] | undefined;
  selecionarConta: contaDestino | undefined;

  ngOnInit(): void {
    this.contasService.listarContas().subscribe({
      next: (contas) => {
        this.contaDestino = contas.map(conta => ({
          id: conta.id,
          name: conta.nome_conta
        }));
      },
      error: (erro) => {
        console.error('Erro ao carregar contas:', erro);
      }
    });
  }

  public doMovimentarContas(): void {
    
  }
  //   if (this.selecionarConta) {
  //     this.selecionarConta.id;
  //   }

  //   console.log(this.);
  //   this.receitaService.cadastrarReceita(this.requestReceita).subscribe({
  //     next: () => alert("Receita cadastrada com sucesso!"),
  //     error: erro => {
  //       console.error(erro)
  //       alert("Erro ao efetuar o cadastro!");
  //     }
  //   });
  // }
  

}
