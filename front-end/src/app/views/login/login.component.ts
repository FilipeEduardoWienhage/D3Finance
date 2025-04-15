import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { AppComponent } from '../../app.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';


@Component({
  selector: 'app-login',
  imports: [
    NavBarComponent,
    FooterComponent,
    FormsModule,
    PasswordModule,
    InputTextModule,
    AppComponent,
    ButtonModule,
    DialogModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  login: string = '';
  password: string = '';

  visible: boolean = false;

    abrirModal() {
        this.visible = true;
    }
}

