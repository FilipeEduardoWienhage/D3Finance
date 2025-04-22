import { Routes } from '@angular/router';
import { HomeComponent } from './views/public/home/home.component';
import { LoginComponent } from './views/public/login/login.component';
import { CadastroComponent } from './views/public/cadastro/cadastro.component';
import { ContatoComponent } from './views/public/contato/contato.component';
import { MainSystemComponent } from './views/private/main-system/main-system.component';

export const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "home", component: HomeComponent },
    { path: "login", component: LoginComponent},
    { path: "cadastro", component: CadastroComponent},
    { path: "contato", component: ContatoComponent},
    { path: "main", component: MainSystemComponent },
    { path: "**", redirectTo: "/home" }
];
