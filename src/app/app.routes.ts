import { Routes } from '@angular/router';

import { comPrototipador } from './prototipador/rotas';

const rotasDasTelas: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'filial' },
  {
    path: 'filial',
    loadComponent: () =>
      import('./telas/branch/branch-list/branch-list.component').then((m) => m.BranchListComponent),
  },
  {
    path: 'filial/nova',
    loadComponent: () =>
      import('./telas/branch/branch-form/branch-form.component').then((m) => m.BranchFormComponent),
  },
  {
    // depois de 'filial/nova', para "nova" não ser lida como código
    path: 'filial/:codigo',
    loadComponent: () =>
      import('./telas/branch/branch-detail/branch-detail.component').then((m) => m.BranchDetailComponent),
    // com o Cadastro em edição, sair da home (breadcrumb, voltar do navegador) pede confirmação
    canDeactivate: [(pagina: { podeSair?: () => Promise<boolean> | boolean } | null) => pagina?.podeSair?.() ?? true],
  },
];

export const routes: Routes = comPrototipador(rotasDasTelas);
