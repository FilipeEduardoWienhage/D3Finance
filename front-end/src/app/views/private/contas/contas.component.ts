import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { SplitterModule } from 'primeng/splitter';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TabMenuModule } from 'primeng/tabmenu';
import { TableModule } from 'primeng/table';
import { ContasService } from '../../../service/contas.service';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contas',
  imports: 
  [
  CommonModule,
  FormsModule,
  TableModule,
  FooterComponent,
  NavBarSystemComponent,
  SplitterModule,
  TabMenuModule,
  ButtonModule,
  DialogModule,
  ToastModule,
  CardModule,
],
  providers: [MessageService],
  templateUrl: './contas.component.html',
  styleUrl: './contas.component.css'
}
)

export class ContasComponent {
  constructor(
    private contasService: ContasService,
    private messageService: MessageService,
  ) {}

  conta: any[] = [];
  saldo: any[] = [];


  ngOnInit(): void {
    this.carregarContas();
  }

  carregarContas(): void {
    this.contasService.getContas().subscribe({
      
      next: (data) => {
        this.conta = data;
      },
      error: (err) => {
        console.error('Erro ao buscar contas:', err);
      }
    });
  }
}
