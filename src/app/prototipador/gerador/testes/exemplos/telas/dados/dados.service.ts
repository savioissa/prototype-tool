import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { CLIENTES, LOJAS } from './dados';
import { Cliente, FiltroDaTela, Loja, Resumo } from './modelo';

@Injectable({ providedIn: 'root' })
export class DadosService {
  listarClientes(): Observable<Cliente[]> {
    return of(CLIENTES);
  }

  async obterLoja(id: number): Promise<Loja | null> {
    return LOJAS.find((loja) => loja.id === id) ?? null;
  }

  resumo(): Observable<Resumo> {
    return of({ total: 0, atualizado: true });
  }

  salvar(): Observable<void> {
    return of(undefined);
  }

  private filtro(): FiltroDaTela {
    return { texto: '' };
  }
}
