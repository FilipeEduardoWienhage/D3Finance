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
import { ConfiguracaoPerfilComponent } from './views/private/configuracao-perfil/configuracao-perfil.component';
import { PesquisarComponent } from './views/private/pesquisar/pesquisar.component';
import { CadastroContasComponent } from './views/private/cadastro-contas/cadastro-contas.component';
import { MovimentacaoEntreContasComponent } from './views/private/movimentacao-entre-contas/movimentacao-entre-contas.component';
import { ContasComponent } from './views/private/contas/contas.component';

export const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "home", component: HomeComponent },
    { path: "login", component: LoginComponent},
    { path: "cadastro", component: CadastroComponent},
    { path: "contato", component: ContatoComponent},
    { path: "visaogeral", component: VisaoGeralComponent},
    { path: "receitas", component: ReceitasComponent},
    { path: "despesas", component: DespesasComponent},
    { path: "receitas/cadastrar", component: CadastroReceitasComponent},
    { path: "despesas/cadastrar", component: CadastroDespesasComponent},
    { path: "importararquivo", component: ImportarArquivosComponent},
    { path: "editarperfil", component: ConfiguracaoPerfilComponent},
    { path: "pesquisar", component: PesquisarComponent},
    { path: "contas/cadastrar", component: CadastroContasComponent},
    { path: "movimentarcontas", component: MovimentacaoEntreContasComponent},
    { path: "contas", component: ContasComponent},
    { path: "**", redirectTo: "/home" }
];
