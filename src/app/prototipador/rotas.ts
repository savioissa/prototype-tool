import { Routes } from '@angular/router';

import { MolduraComponent } from './moldura/moldura.component';
import { PrincipalComponent } from './principal/principal.component';

/**
 * Envolve as rotas das telas com a moldura do prototipador.
 * As rotas `_proto/*` vêm antes das telas, para que um `**` das telas não as capture.
 * As rotas das telas entram inalteradas.
 */
export function comPrototipador(rotasDasTelas: Routes): Routes {
  return [
    {
      path: '',
      component: MolduraComponent,
      children: [
        {
          path: '_proto/teste',
          loadComponent: () => import('./teste/teste.component').then((m) => m.TesteComponent),
        },
        {
          path: '_proto/dados',
          loadComponent: () => import('./dados/dados.component').then((m) => m.DadosComponent),
        },
        {
          path: '_proto/traducoes',
          loadComponent: () =>
            import('./traducoes/traducoes.component').then((m) => m.TraducoesComponent),
        },
        { path: '', component: PrincipalComponent, children: rotasDasTelas },
      ],
    },
  ];
}
