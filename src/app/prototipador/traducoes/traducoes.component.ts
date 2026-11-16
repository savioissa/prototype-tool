import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';

import { COMPONENTES } from '../gerado/componentes.gerado';
import { TAGS } from '../gerado/tags.gerado';
import type { TagUsada, UsoDeTag } from '../modelo/tipos';
import { TelaAtualService, componentesDaTela } from '../moldura/tela-atual.service';

type Escopo = 'tela' | 'todas';
type Status = 'todas' | 'novas' | 'existentes';
type Coluna = 'status' | 'chave' | 'pt' | 'en' | 'es' | 'componente' | 'contexto';

/** Tag com os usos já filtrados pelo escopo. */
interface Linha {
  tag: TagUsada;
  usos: UsoDeTag[];
}

/** Aba Traduções: as tags usadas nas telas, com textos, status na planilha e contexto de uso. */
@Component({
  selector: 'proto-traducoes',
  standalone: true,
  imports: [NgTemplateOutlet, FormsModule, InputTextModule, SelectButtonModule],
  templateUrl: './traducoes.component.html',
  styleUrl: './traducoes.component.css',
})
export class TraducoesComponent {
  private readonly telaAtual = inject(TelaAtualService);

  protected readonly dados = TAGS;
  protected readonly escopos = [
    { rotulo: 'Tela atual', valor: 'tela' },
    { rotulo: 'Todas', valor: 'todas' },
  ];
  protected readonly status = [
    { rotulo: 'Todas', valor: 'todas' },
    { rotulo: 'Novas', valor: 'novas' },
    { rotulo: 'Existentes', valor: 'existentes' },
  ];

  protected readonly escopo = signal<Escopo>('tela');
  protected readonly filtroDeStatus = signal<Status>('todas');
  protected readonly busca = signal('');
  protected readonly ordem = signal<{ coluna: Coluna; crescente: boolean }>({ coluna: 'status', crescente: true });
  protected readonly abertas = signal(new Set<string>());
  protected readonly copiada = signal<string | null>(null);
  protected readonly avisosAbertos = signal(false);

  /** Sem tela atual (primeiro acesso direto à aba), mostra todas. */
  protected readonly semTelaAtual = computed(() => !this.telaAtual.tela());
  private readonly componentesDoEscopo = computed<Set<string> | null>(() => {
    const tela = this.telaAtual.tela();
    return this.escopo() === 'tela' && tela ? componentesDaTela(tela.idsRaiz, COMPONENTES) : null;
  });

  /** Tags do escopo, antes da busca e do filtro de status. */
  private readonly doEscopo = computed<Linha[]>(() => {
    const escopo = this.componentesDoEscopo();
    return this.dados.tags
      .map((tag) => ({ tag, usos: escopo ? tag.usos.filter((u) => escopo.has(u.componente)) : tag.usos }))
      .filter((linha) => linha.usos.length > 0);
  });

  protected readonly linhas = computed<Linha[]>(() => {
    const termo = normalizar(this.busca().trim());
    const status = this.filtroDeStatus();
    const { coluna, crescente } = this.ordem();
    const filtradas = this.doEscopo().filter(({ tag }) => {
      if (status === 'novas' && tag.naPlanilha !== false) return false;
      if (status === 'existentes' && tag.naPlanilha !== true) return false;
      if (!termo) return true;
      return [tag.chave, tag.textos.pt, tag.textos.en, tag.textos.es].some((t) => t && normalizar(t).includes(termo));
    });
    const valor = (linha: Linha): string => {
      switch (coluna) {
        case 'status':
          return `${ordemDoStatus(linha.tag)}|${linha.tag.chave}`;
        case 'chave':
          return linha.tag.chave;
        case 'componente':
          return linha.usos[0].componente;
        case 'contexto':
          return linha.usos[0].papel;
        default:
          return linha.tag.textos[coluna] ?? '';
      }
    };
    return [...filtradas].sort((a, b) => valor(a).localeCompare(valor(b), 'pt-BR') * (crescente ? 1 : -1));
  });

  protected readonly resumo = computed(() => {
    const linhas = this.doEscopo();
    return {
      total: linhas.length,
      novas: linhas.filter((l) => l.tag.naPlanilha === false).length,
      existentes: linhas.filter((l) => l.tag.naPlanilha === true).length,
    };
  });

  protected ordenar(coluna: Coluna): void {
    this.ordem.update((atual) => ({ coluna, crescente: atual.coluna === coluna ? !atual.crescente : true }));
  }

  protected setaDe(coluna: Coluna): string {
    const { coluna: atual, crescente } = this.ordem();
    return atual !== coluna ? '' : crescente ? 'pi-arrow-up' : 'pi-arrow-down';
  }

  protected alternar(chave: string): void {
    this.abertas.update((abertas) => {
      const novas = new Set(abertas);
      if (novas.has(chave)) novas.delete(chave);
      else novas.add(chave);
      return novas;
    });
  }

  protected async copiar(chave: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(chave);
      this.copiada.set(chave);
      setTimeout(() => this.copiada.update((atual) => (atual === chave ? null : atual)), 1500);
    } catch {
      // Sem acesso à área de transferência (ex.: página sem foco); a chave continua selecionável.
    }
  }

  protected rotuloDoStatus(tag: TagUsada): string {
    return tag.naPlanilha === null ? 'sem planilha' : tag.naPlanilha ? 'Existente' : 'Nova';
  }
}

function ordemDoStatus(tag: TagUsada): number {
  return tag.naPlanilha === false ? 0 : tag.naPlanilha === true ? 1 : 2;
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
