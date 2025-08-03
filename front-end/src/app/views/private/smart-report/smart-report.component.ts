import { Component, inject } from '@angular/core';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { SplitterModule } from 'primeng/splitter';
import { HeaderSystemComponent } from "../header-system/header-system.component";
import { EditorModule } from 'primeng/editor';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-smart-report',
  imports: [
    NavBarSystemComponent,
    FooterComponent,
    ToastModule,
    SplitterModule,
    HeaderSystemComponent,
    EditorModule,
    FormsModule,
    MessageModule,
    ButtonModule,
    CardModule,
  ],
  templateUrl: './smart-report.component.html',
  styleUrl: './smart-report.component.css'
})
export class SmartReportComponent {

  text: string | undefined;

}

