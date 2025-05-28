import { Component, OnInit, PLATFORM_ID, ChangeDetectorRef, inject, effect } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import { ReceitasService } from '../../../service/receitas.service';
import { ReceitaConsolidada } from '../../../models/receita-consolidada';

@Component({
  selector: 'app-receitas',
  imports: [ChartModule, FooterComponent, NavBarSystemComponent, SplitterModule],
  templateUrl: './receitas.component.html',
  styleUrl: './receitas.component.css',
  providers: [MessageService],
})
export class ReceitasComponent {
  dados: ReceitaConsolidada[] = [];
  data: any;
  options: any;

  platformId = inject(PLATFORM_ID);


  ngOnInit() {
    this.receitaService.getReceitasConsolidadas().subscribe({
      next: (dados) => {
        this.dados = dados;
            this.initChart();
      },
      error: (err) => {
        console.error('Erro ao carregar contas:', err);
      }
    });


  }

  constructor(private cd: ChangeDetectorRef, private receitaService: ReceitasService) { }

  initChart() {
    console.log("asodkaoskd");
    
    console.log(this.dados.map(x => x.valor))
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

      this.data = {
        labels: [
          'Janeiro',
          'Fevereiro',
          'Março',
          'Abril',
          'Maio',
          'Junho',
          'Julho',
          'Agosto',
          'Setembro',
          'Outubro',
          'Novembro',
          'Dezembro'
        ],
        datasets: [
          {
            label: 'My First dataset',
            backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
            borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
            data: this.dados.map(x => x.valor)
          },
        ]
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500
              }
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            }
          },
          y: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            }
          }
        }
      };
      this.cd.markForCheck()
    }
  }
}
