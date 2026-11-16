import { Injectable, Type, inject, reflectComponentType, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { gravar, ler } from './armazenamento';

export interface TelaAtual {
  url: string;
  idsRaiz: string[];
}

const CHAVE = 'proto.telaAtual';

/** Mesma regra do campo `id` do registro de componentes: o seletor, ou o nome da classe. */
export function idDoComponente(componente: Type<unknown>): string {
  const seletor = reflectComponentType(componente)?.selector;
  return seletor && seletor !== 'ng-component' ? seletor : componente.name;
}

/**
 * Componentes da tela: os ligados às rotas (`idsRaiz`) mais todos os que aparecem, direta ou
 * indiretamente, nos templates deles, seguindo o campo `filhos` do registro.
 */
export function componentesDaTela(idsRaiz: string[], registro: { id: string; filhos: string[] }[]): Set<string> {
  const porId = new Map(registro.map((componente) => [componente.id, componente]));
  const encontrados = new Set<string>();
  const pendentes = idsRaiz.filter((id) => porId.has(id));
  while (pendentes.length) {
    const id = pendentes.pop()!;
    if (!encontrados.has(id)) {
      encontrados.add(id);
      pendentes.push(...(porId.get(id)?.filhos ?? []));
    }
  }
  return encontrados;
}

/** Acompanha a navegação e guarda a última rota visitada fora de `/_proto`. */
@Injectable({ providedIn: 'root' })
export class TelaAtualService {
  private readonly router = inject(Router);

  readonly tela = signal<TelaAtual | null>(ler<TelaAtual | null>(CHAVE, null));

  constructor() {
    this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe((evento) => this.registrar(evento.urlAfterRedirects));
  }

  esquecer(): void {
    this.tela.set(null);
    gravar(CHAVE, null);
  }

  private registrar(url: string): void {
    if (url.startsWith('/_proto')) {
      return;
    }
    const tela: TelaAtual = { url, idsRaiz: this.idsDasRotasAtivas() };
    this.tela.set(tela);
    gravar(CHAVE, tela);
  }

  private idsDasRotasAtivas(): string[] {
    const ids: string[] = [];
    const percorrer = (rota: ActivatedRouteSnapshot): void => {
      if (rota.component) {
        const id = idDoComponente(rota.component);
        // Os componentes do prototipador têm todos seletor começando com `proto-`.
        if (!id.startsWith('proto-') && !ids.includes(id)) {
          ids.push(id);
        }
      }
      rota.children.forEach(percorrer);
    };
    // A raiz da árvore aponta para o componente de bootstrap, que não é ligado a nenhuma rota.
    this.router.routerState.snapshot.root.children.forEach(percorrer);
    return ids;
  }
}
