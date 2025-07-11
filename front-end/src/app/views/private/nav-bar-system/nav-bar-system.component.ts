import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { TelegramService, TelegramConfig, ChatIdResponse } from '../../../service/telegram.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar-system',
  standalone: true,
  imports: [
    MenuModule, 
    MenubarModule,
    ToastModule, 
    ConfirmDialogModule, 
    DialogModule, 
    ButtonModule, 
    InputTextModule, 
    InputSwitchModule, 
    DividerModule, 
    TagModule,
    CheckboxModule,
    MessageModule,
    TooltipModule,
    FormsModule,
    CommonModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './nav-bar-system.component.html',
  styleUrl: './nav-bar-system.component.css'
})

export class NavBarSystemComponent implements OnInit {
  items: MenuItem[] | undefined;
  
  // Variáveis para o modal do Telegram
  showTelegramModal = false;
  telegramConfig: TelegramConfig | null = null;
  chatId = '';
  isActive = false;
  isLoading = false;
  message = '';
  showChatIdHelp = false;

  constructor(
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService,
    private telegramService: TelegramService,
    private messageService: MessageService
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
            label: 'Telegram BOT',
            icon: 'pi pi-telegram',
            command: () => this.openTelegramModal()
          },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => this.confirmLogout()
          }
        ]
      }
    ];
    this.loadTelegramConfig();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  openTelegramModal(): void {
    this.showTelegramModal = true;
    this.loadTelegramConfig();
  }

  closeTelegramModal(): void {
    this.showTelegramModal = false;
    this.resetForm();
  }

  loadTelegramConfig(): void {
    this.isLoading = true;
    this.telegramService.obterConfiguracao().subscribe({
      next: (config) => {
        this.telegramConfig = config;
        if (config) {
          this.chatId = config.chat_id;
          this.isActive = config.ativo;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar configuração:', error);
        this.isLoading = false;
      }
    });
  }

  saveTelegramConfig(): void {
    if (!this.chatId.trim()) {
      this.message = 'Por favor, insira o Chat ID';
      return;
    }

    this.isLoading = true;
    const config: TelegramConfig = {
      usuario_id: 0, // Será definido pelo backend
      chat_id: this.chatId.trim(),
      ativo: this.isActive
    };

    this.telegramService.configurarTelegram(config).subscribe({
      next: (response) => {
        this.telegramConfig = response;
        this.message = 'Configuração salva com sucesso!';
        this.isLoading = false;
        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Erro ao salvar configuração:', error);
        this.message = 'Erro ao salvar configuração';
        this.isLoading = false;
        setTimeout(() => {
          this.message = '';
        }, 3000);
      }
    });
  }

  sendTestMessage(): void {
    if (!this.telegramConfig) {
      this.message = 'Configure o Telegram primeiro';
      return;
    }

    this.isLoading = true;
    const testMessage = {
      message: 'Esta é uma mensagem de teste do D3 Finance para verificar se a integração está funcionando corretamente.'
    };
    
    this.telegramService.enviarMensagemTeste(testMessage).subscribe({
      next: (response) => {
        this.message = 'Mensagem de teste enviada com sucesso!';
        this.isLoading = false;
        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Erro ao enviar mensagem de teste:', error);
        this.message = 'Erro ao enviar mensagem de teste. Verifique se o Chat ID está correto.';
        this.isLoading = false;
        setTimeout(() => {
          this.message = '';
        }, 3000);
      }
    });
  }

  removeTelegramConfig(): void {
    if (!this.telegramConfig) {
      this.message = 'Nenhuma configuração para remover';
      return;
    }

    this.isLoading = true;
    this.telegramService.removerConfiguracao().subscribe({
      next: (response) => {
        this.telegramConfig = null;
        this.resetForm();
        this.message = 'Configuração removida com sucesso!';
        this.isLoading = false;
        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Erro ao remover configuração:', error);
        this.message = 'Erro ao remover configuração';
        this.isLoading = false;
        setTimeout(() => {
          this.message = '';
        }, 3000);
      }
    });
  }

  toggleChatIdHelp(): void {
    this.showChatIdHelp = !this.showChatIdHelp;
  }

  getStatusText(): string {
    if (!this.telegramConfig) return 'Não configurado';
    return this.telegramConfig.ativo ? 'Ativo' : 'Inativo';
  }

  getStatusSeverity(): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    if (!this.telegramConfig) return 'warn';
    return this.telegramConfig.ativo ? 'success' : 'danger';
  }

  private resetForm(): void {
    this.chatId = '';
    this.isActive = false;
    this.message = '';
    this.showChatIdHelp = false;
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
}
