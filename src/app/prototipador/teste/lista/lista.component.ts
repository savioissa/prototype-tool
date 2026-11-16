import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import type { ComponenteRegistrado } from '../../modelo/tipos';
import { TesteEstadoService } from '../teste-estado.service';

/** Nó da árvore: um componente e os componentes que ele usa no template. */
export interface NoDaArvore {
  /** Caminho de ids desde a raiz; o mesmo componente aparece sob cada pai que o usa. */
  chave: string;
  componente: ComponenteRegistrado;
  filhos: NoDaArvore[];
  /** O componente já aparece acima neste mesmo ramo (template recursivo). */
  ciclo: boolean;
}

/** Árvore de relacionamento: componentes pai e, abaixo, os filhos que usam no template. */
@Component({
  selector: 'proto-teste-lista',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './lista.component.html',
  styleUrl: './lista.component.css',
})
export class ListaComponent {
  protected readonly estado = inject(TesteEstadoService);
  /** Um componente foi escolhido na árvore. */
  @Output() escolher = new EventEmitter<void>();
  @Output() fechar = new EventEmitter<void>();
  /** Nós recolhidos, pela chave. Todos começam abertos. */
  protected readonly recolhidos = signal(new Set<string>());

  protected readonly raizes = computed<NoDaArvore[]>(() => {
    const registro = this.estado.registro;
    const porId = new Map(registro.map((componente) => [componente.id, componente]));

    // Raízes: os componentes que nenhum outro usa (as páginas); os que só existem em ciclos entram também.
    const usados = new Set(registro.flatMap((componente) => componente.filhos));
    const ids = registro.filter((componente) => !usados.has(componente.id)).map((componente) => componente.id);
    const alcancados = new Set<string>();
    const marcar = (id: string) => {
      if (!alcancados.has(id)) {
        alcancados.add(id);
        porId.get(id)?.filhos.forEach(marcar);
      }
    };
    ids.forEach(marcar);
    ids.push(...registro.filter((componente) => !alcancados.has(componente.id)).map((componente) => componente.id));

    const montar = (id: string, caminho: string[]): NoDaArvore => {
      const componente = porId.get(id)!;
      const chave = [...caminho, id].join('>');
      const ciclo = caminho.includes(id);
      return {
        chave,
        componente,
        ciclo,
        filhos: ciclo ? [] : componente.filhos.filter((filho) => porId.has(filho)).map((filho) => montar(filho, [...caminho, id])),
      };
    };
    return ids.sort((a, b) => a.localeCompare(b)).map((id) => montar(id, []));
  });

  protected escolherComponente(id: string): void {
    this.estado.selecionar(id);
    this.escolher.emit();
  }

  protected alternar(chave: string): void {
    this.recolhidos.update((recolhidos) => {
      const novos = new Set(recolhidos);
      if (novos.has(chave)) {
        novos.delete(chave);
      } else {
        novos.add(chave);
      }
      return novos;
    });
  }
}
