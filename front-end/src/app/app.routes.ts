import { Routes } from '@angular/router';
import { HomeComponent } from './views/public/home/home.component';
import { LoginComponent } from './views/public/login/login.component';
import { CadastroComponent } from './views/public/cadastro/cadastro.component';
import { ContatoComponent } from './views/public/contato/contato.component';
import { VisaoGeralComponent } from './views/private/visao-geral/visao-geral.component';
import { ReceitasComponent } from './views/private/receitas/receitas.component';
import { DespesasComponent } from './views/private/despesas/despesas.component';
import { CadastroReceitasComponent } from './views/private/cadastro-receitas/cadastro-receitas.component';
import { CadastroDespesasComponent } from './views/private/cadastro-despesas/cadastro-despesas.component';
import { ImportarArquivosComponent } from './views/private/importar-arquivos/importar-arquivos.component';
import { CadastroContasComponent } from './views/private/cadastro-contas/cadastro-contas.component';
import { MovimentacaoEntreContasComponent } from './views/private/movimentacao-entre-contas/movimentacao-entre-contas.component';
import { authGuard } from './guards/auth.guards';
import { PlanosComponent } from './views/public/planos/planos.component';

//Rotas com a autenticação ativada
export const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "home", component: HomeComponent },
    { path: "login", component: LoginComponent},
    { path: "cadastro", component: CadastroComponent},
    { path: "contato", component: ContatoComponent},
    { path: "planos", component: PlanosComponent},
    { path: "visaogeral", component: VisaoGeralComponent, canActivate: [authGuard] },
    { path: "receitas", component: ReceitasComponent, canActivate: [authGuard]},
    { path: "despesas", component: DespesasComponent, canActivate: [authGuard]},
    { path: "receitas/cadastrar", component: CadastroReceitasComponent, canActivate: [authGuard]},
    { path: "despesas/cadastrar", component: CadastroDespesasComponent, canActivate: [authGuard]},
    { path: "importararquivo", component: ImportarArquivosComponent, canActivate: [authGuard]},
    { path: "contas/cadastrar", component: CadastroContasComponent, canActivate: [authGuard]},
    { path: "movimentarcontas", component: MovimentacaoEntreContasComponent, canActivate: [authGuard]},
    { path: "**", redirectTo: "/home" }
];

