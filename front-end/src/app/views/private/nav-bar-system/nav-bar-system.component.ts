import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';


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
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.items = [
      {
        label: 'D3 Finance',
        items: [
          {
            label: 'Visão geral',
            icon: 'pi pi-chart-bar',
            command: () => this.router.navigate(['/visaogeral'])
          },
          {
            label: 'Receitas',
            icon: 'pi pi-chart-line',
            command: () => this.router.navigate(['/receitas'])
          },
          {
            label: 'Despesas',
            icon: 'pi pi-chart-line',
            command: () => this.router.navigate(['/despesas'])
          },
          {
            label: 'Movimentação entre contas',
            icon: 'pi pi-arrow-right-arrow-left',
            command: () => this.router.navigate(['/movimentarcontas'])
          },
          {
            label: 'Cadastrar receitas',
            icon: 'pi pi-plus',
            command: () => this.router.navigate(['/receitas/cadastrar'])
          },
          {
            label: 'Cadastrar despesas',
            icon: 'pi pi-plus',
            command: () => this.router.navigate(['/despesas/cadastrar'])
          },
          {
            label: 'Cadastrar contas',
            icon: 'pi pi-plus',
            command: () => this.router.navigate(['/contas/cadastrar'])
          },
          {
            label: 'Importar arquivo CSV',
            icon: 'pi pi-cloud-upload',
            command: () => this.router.navigate(['/importararquivo'])
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
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
