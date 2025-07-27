import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { Fluid } from 'primeng/fluid';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { SplitterModule } from 'primeng/splitter';
import { DespesasService } from '../../../service/despesas.service';
import { DespesaRequestModel } from '../../../models/RequestDespesas';
import { ContasService } from '../../../service/contas.service';
import { ToastModule } from 'primeng/toast';

interface formaRecebimento {
  name: string;
}

interface contaDestino {
  id: number;
  name: string;
}

interface categoriaDespesa {
  name: string;
}

@Component({
  selector: 'app-cadastro-despesas',
  standalone: true,
  imports: [
    FooterComponent,
    NavBarSystemComponent,
    CardModule,
    Fluid,
    InputNumber,
    DatePicker,
    TextareaModule,
    SelectModule,
    ButtonModule,
    FormsModule,
    SplitterModule,
    ToastModule,
  ],
  templateUrl: './cadastro-despesas.component.html',
  styleUrl: './cadastro-despesas.component.css',
  providers: [
    MessageService,
  ]
})
export class CadastroDespesasComponent {
  public requestDespesa!: DespesaRequestModel;

  constructor(
    private despesasService: DespesasService,
    private contasService: ContasService,
    private messageService: MessageService,
  ) { }

  valorDespesa: number = 0;
  dataRecebimento: Date | null = null;
  formaDeRecebimento: formaRecebimento[] | undefined;
  selecionarForma: formaRecebimento | undefined;
  categoriaDespesa: string = '';
  categoriaDaDespesa: categoriaDespesa[] | undefined;
  selecionarCategoria: categoriaDespesa | undefined;
  contaDestino: contaDestino[] | undefined;
  selecionarConta: contaDestino | undefined;

  ngOnInit(): void {
    this.requestDespesa = new DespesaRequestModel();

    this.categoriaDaDespesa = [
      { name: 'Despesas Administrativas' },
      { name: 'Despesas com Marketing' },
      { name: 'Despesas com Materiais' },
      { name: 'Despesas com Pessoal' },
      { name: 'Despesas com Terceirizados' },
      { name: 'Despesas Financeiras' },
      { name: 'Despesas Operacionais' },
      { name: 'Despesas com Transporte' },
      { name: 'Impostos e Taxas' },
      { name: 'Manutenção e Reparos' },
      { name: 'Outras Despesas' }
    ];
    this.formaDeRecebimento = [
      { name: 'Cheque' },
      { name: 'Crédito' },
      { name: 'Débito' },
      { name: 'Depósito' },
      { name: 'Dinheiro' },
      { name: 'Pix' }
    ];
    this.contasService.listarContas().subscribe({
      next: (contas) => {
        this.contaDestino = contas
          .map(conta => ({
            id: conta.id,
            name: conta.nome_conta
          }))
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      },
      error: (erro) => {
        console.error('Erro ao carregar contas:', erro);
      }
    });

  }
  public doCadastroDespesas(): void {

    if (this.selecionarConta) {
      this.requestDespesa.conta_id = this.selecionarConta.id;
    }

    console.log(this.requestDespesa);
    this.despesasService.cadastrarDespesa(this.requestDespesa).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Despesa cadastrada com sucesso!',
        });

        this.requestDespesa = new DespesaRequestModel();
        this.selecionarForma = undefined;
        this.selecionarCategoria = undefined;
        this.selecionarConta = undefined;
      },
      error: (erro) => {
        console.error('Erro ao cadastrar despesa:', erro);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao cadastrar despesa. Tente novamente.',
        });
      }
    });
  }
}