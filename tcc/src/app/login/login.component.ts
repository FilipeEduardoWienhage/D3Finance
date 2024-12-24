import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { FocusTrapModule } from 'primeng/focustrap';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AutoFocusModule } from 'primeng/autofocus';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-login',
  imports: [
    NavBarComponent,
    FocusTrapModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    AutoFocusModule,
    Card,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  name: string = '';

    email: string = '';

    accept: boolean = false;
}
