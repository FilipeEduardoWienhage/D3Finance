import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-pesquisar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    FooterComponent,
    NavBarSystemComponent,
    SplitterModule,
  ],
  providers: [MessageService],
  templateUrl: './pesquisar.component.html',
  styleUrl: './pesquisar.component.css'
})
export class PesquisarComponent {
  items = [
    { categoria: 'Salário', nome: 'Pagamento Mensal', valor: 5000, data: '2025-04-01' },
    { categoria: 'Aluguel', nome: 'Apartamento', valor: 1200, data: '2025-04-05' },
    { categoria: 'Comida', nome: 'Supermercado', valor: 450, data: '2025-04-10' },
    { categoria: 'Lazer', nome: 'Cinema', valor: 50, data: '2025-04-15' },
    { categoria: 'Lazer', nome: 'Academia', valor: 120, data: '2025-04-15' },
    { categoria: 'Lazer', nome: 'Parque', valor: 520, data: '2025-04-25' },
  ];

  filteredItems = [...this.items];

  filters = {
    categoria: '',
    nome: '',
    valor: '',
    data: ''
  };

  first = 0;
  rows = 10;

  onFilterChange() {
    this.filteredItems = this.items.filter(item =>
      item.categoria.toLowerCase().includes(this.filters.categoria.toLowerCase()) &&
      item.nome.toLowerCase().includes(this.filters.nome.toLowerCase()) &&
      (this.filters.valor === '' || item.valor === +this.filters.valor) &&
      (this.filters.data === '' || item.data === this.filters.data)
    );
    this.first = 0;
  }

  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }
}
