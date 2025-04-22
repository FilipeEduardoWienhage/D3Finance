import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-nav-bar-system',
  imports: [ToastModule, Menu],
  templateUrl: './nav-bar-system.component.html',
  styleUrl: './nav-bar-system.component.css'
})
export class NavBarSystemComponent {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'D2 Finance',
        items: [
          {
            label: 'Visão Geral',
            icon: 'pi pi-chart-bar'
          },
          {
            label: 'Receitas',
            icon: 'pi pi-chart-line'
          },
          {
            label: 'Despesas',
            icon: 'pi pi-chart-line'
          },
          {
            label: 'Cadastrar Receitas',
            icon: 'pi pi-plus'
          },
          {
            label: 'Cadastrar Despesas',
            icon: 'pi pi-plus'
          },
          {
            label: 'Importar arquivo XML',
            icon: 'pi pi-plus'
          },
          {
            label: 'Pesquisar',
            icon: 'pi pi-search'
          }
        ]
      },
      {
        label: 'Perfil',
        items: [
          {
            label: 'Configurações',
            icon: 'pi pi-cog'
          },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out'
          }
        ]
      }
    ];
  }

}
