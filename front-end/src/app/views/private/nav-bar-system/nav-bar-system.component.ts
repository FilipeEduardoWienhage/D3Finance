import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';


@Component({
  selector: 'app-nav-bar-system',
  standalone: true,
  imports: [MenuModule, ToastModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './nav-bar-system.component.html',
  styleUrl: './nav-bar-system.component.css'
})

export class NavBarSystemComponent {
  items: MenuItem[] | undefined;

  constructor(
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

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
            icon: 'pi pi-sign-out',
            command: () => this.confirmLogout()
          }
        ]
      }
    ];
  }
  confirmLogout() {
    this.confirmationService.confirm({
      message: 'Deseja realmente sair?',
      header: 'Logout',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sair',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.logout();
      }
    });
  }

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/home']);
  }
}
