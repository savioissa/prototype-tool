import { DestroyRef, EnvironmentProviders, Injectable, Provider, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AVISOS_DE_COMPONENTES, COMPONENTES } from '../gerado/componentes.gerado';
import type { ComponenteRegistrado } from '../modelo/tipos';
import { Ajuste, Estado } from './ajustar';
import { desserializar, resumir, serializar } from './valores';

export const ESTADO_PADRAO = 'Padrão';
const MAXIMO_DE_EVENTOS = 50;

export interface EventoEmitido {
  hora: Date;
  output: string;
  valor: string;
}

/** Ajuste carregado do `.proto.ts`, ou o erro de quando ele não pôde ser importado. */
export interface AjusteCarregado {
  ajuste: Ajuste | null;
  erro: string | null;
}

/** Estado do ajuste já na forma única usada pela área de teste. */
export interface EstadoDoComponente {
  nome: string;
  descricao: string | null;
  inputs: Estado['inputs'];
  provedores: (Provider | EnvironmentProviders)[];
  acao: Estado['acao'] | null;
}

const ESTADO_SEM_AJUSTE: EstadoDoComponente = { nome: ESTADO_PADRAO, descricao: null, inputs: {}, provedores: [], acao: null };

/**
 * Estado da área de teste. O componente e o estado vêm da URL (`?c=&v=`); as edições ficam
 * no sessionStorage, por componente e estado, para sobreviver ao recarregamento automático.
 */
@Injectable()
export class TesteEstadoService {
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);

  readonly registro: ComponenteRegistrado[] = COMPONENTES;
  readonly avisosGerais: string[] = AVISOS_DE_COMPONENTES;

  readonly ajustes = signal(new Map<string, AjusteCarregado>());
  readonly ajustesProntos = signal(false);

  private readonly idNaUrl = signal<string | null>(null);
  private readonly estadoNaUrl = signal<string | null>(null);

  readonly selecionado = computed(() => this.registro.find((c) => c.id === this.idNaUrl()) ?? null);
  /** Id pedido na URL que não existe no registro (componente apagado ou renomeado). */
  readonly idInexistente = computed(() => (this.idNaUrl() && !this.selecionado() ? this.idNaUrl() : null));
  readonly ajuste = computed(() => {
    const componente = this.selecionado();
    return componente ? (this.ajustes().get(componente.id)?.ajuste ?? null) : null;
  });

  /** Estados do ajuste (`estados` e depois `variacoes`); sem nenhum, só o Padrão. */
  readonly estados = computed<EstadoDoComponente[]>(() => {
    const ajuste = this.ajuste();
    const estados: EstadoDoComponente[] = [
      ...Object.entries(ajuste?.estados ?? {}).map(([nome, estado]) => ({
        nome,
        descricao: estado.descricao ?? null,
        inputs: estado.inputs ?? {},
        provedores: estado.provedores ?? [],
        acao: estado.acao ?? null,
      })),
      ...Object.entries(ajuste?.variacoes ?? {}).map(([nome, inputs]) => ({ ...ESTADO_SEM_AJUSTE, nome, inputs })),
    ];
    return estados.length ? estados : [ESTADO_SEM_AJUSTE];
  });
  readonly estado = computed(() => {
    const estados = this.estados();
    return estados.find((estado) => estado.nome === this.estadoNaUrl()) ?? estados[0];
  });

  /** Muda para o palco recriar o componente do zero (troca de componente ou de estado, restaurar). */
  readonly versao = signal(0);

  /**
   * Inputs definidos pelo estado, só os que existem no componente. Depende da versão para que
   * inputs criados por função (ex.: FormGroup) venham novos a cada recriação.
   */
  readonly valoresDoEstado = computed(() => {
    this.versao();
    const componente = this.selecionado();
    const estado = this.estado();
    if (!componente) {
      return {};
    }
    const valores = typeof estado.inputs === 'function' ? estado.inputs() : (estado.inputs ?? {});
    const nomes = new Set(componente.inputs.map((input) => input.nome));
    const conhecidos: Record<string, unknown> = {};
    for (const [nome, valor] of Object.entries(valores)) {
      if (nomes.has(nome)) {
        conhecidos[nome] = valor;
      } else {
        console.warn(`[proto] O estado "${estado.nome}" de ${componente.id} define "${nome}", que não é input do componente. Ignorado.`);
      }
    }
    return conhecidos;
  });

  readonly edicoes = signal<Record<string, unknown>>({});
  /** O que o palco aplica: só os inputs que o estado define ou que o usuário editou. */
  readonly valores = computed(() => ({ ...this.valoresDoEstado(), ...this.edicoes() }));

  readonly eventos = signal<EventoEmitido[]>([]);

  constructor() {
    const assinatura = this.rota.queryParamMap.subscribe((parametros) => {
      this.idNaUrl.set(parametros.get('c'));
      this.estadoNaUrl.set(parametros.get('v'));
    });
    inject(DestroyRef).onDestroy(() => assinatura.unsubscribe());

    this.carregarAjustes();

    // Ao mudar de componente ou de estado, retoma as edições guardadas e recria o componente.
    let anterior: string | null = null;
    effect(
      () => {
        const componente = this.selecionado();
        const estado = this.estado().nome;
        if (!this.ajustesProntos()) {
          return;
        }
        untracked(() => {
          if (componente?.id !== anterior) {
            this.eventos.set([]);
            anterior = componente?.id ?? null;
          }
          this.edicoes.set(componente ? lerEdicoes(componente.id, estado) : {});
          this.versao.update((v) => v + 1);
        });
      },
      { allowSignalWrites: true },
    );
  }

  selecionar(id: string): void {
    this.navegar({ c: id, v: null });
  }

  escolherEstado(nome: string): void {
    if (nome === this.estado().nome) {
      return;
    }
    const componente = this.selecionado();
    if (componente) {
      // Trocar de estado descarta as edições do atual e as que estavam guardadas para o novo.
      apagarEdicoes(componente.id, this.estado().nome);
      apagarEdicoes(componente.id, nome);
    }
    this.navegar({ v: nome });
  }

  editar(nome: string, valor: unknown): void {
    this.edicoes.update((edicoes) => ({ ...edicoes, [nome]: valor }));
    const componente = this.selecionado();
    if (componente) {
      gravarEdicoes(componente.id, this.estado().nome, this.edicoes());
    }
  }

  restaurar(): void {
    const componente = this.selecionado();
    if (componente) {
      apagarEdicoes(componente.id, this.estado().nome);
    }
    this.edicoes.set({});
    this.versao.update((v) => v + 1);
  }

  registrarEvento(output: string, valor: unknown): void {
    const evento: EventoEmitido = { hora: new Date(), output, valor: resumir(valor) };
    this.eventos.update((eventos) => [evento, ...eventos].slice(0, MAXIMO_DE_EVENTOS));
  }

  limparEventos(): void {
    this.eventos.set([]);
  }

  /** Avisos que ainda valem, por id: um input não editável deixa de ser problema se o ajuste o cobre. */
  readonly avisos = computed(() => {
    const porId = new Map<string, string[]>();
    for (const componente of this.registro) {
      const carregado = this.ajustes().get(componente.id);
      const ajuste = carregado?.ajuste;
      const cobertos = new Set([
        ...Object.keys(ajuste?.tipos ?? {}),
        ...Object.values(ajuste?.variacoes ?? {}).flatMap((valores) => Object.keys(valores)),
        ...Object.values(ajuste?.estados ?? {}).flatMap((estado) =>
          Object.keys((typeof estado.inputs === 'function' ? estado.inputs() : estado.inputs) ?? {}),
        ),
      ]);
      const avisos = componente.avisos.filter((aviso) => {
        const input = /^Input "([^".[]+)/.exec(aviso)?.[1];
        return !input || !cobertos.has(input);
      });
      porId.set(componente.id, carregado?.erro ? [`Arquivo de ajuste: ${carregado.erro}`, ...avisos] : avisos);
    }
    return porId;
  });

  private navegar(parametros: Record<string, string | null>): void {
    this.router.navigate([], { relativeTo: this.rota, queryParams: parametros, queryParamsHandling: 'merge' });
  }

  private async carregarAjustes(): Promise<void> {
    const carregados = await Promise.all(
      this.registro
        .filter((componente) => componente.ajuste)
        .map(async (componente): Promise<[string, AjusteCarregado]> => {
          try {
            const ajuste = await componente.ajuste!();
            if (!ajuste || typeof ajuste !== 'object') {
              return [componente.id, { ajuste: null, erro: 'o export default não é um objeto de ajuste.' }];
            }
            return [componente.id, { ajuste: ajuste as Ajuste, erro: null }];
          } catch (erro) {
            console.warn(`[proto] Não foi possível carregar o ajuste de ${componente.id}.`, erro);
            return [componente.id, { ajuste: null, erro: (erro as Error).message }];
          }
        }),
    );
    this.ajustes.set(new Map(carregados));
    this.ajustesProntos.set(true);
  }
}

// ---------- sessionStorage ----------

const chaveDasEdicoes = (id: string, estado: string) => `proto.teste.edicoes:${id}:${estado}`;

function lerEdicoes(id: string, estado: string): Record<string, unknown> {
  try {
    const texto = sessionStorage.getItem(chaveDasEdicoes(id, estado));
    return texto ? desserializar(texto) : {};
  } catch {
    return {};
  }
}

function gravarEdicoes(id: string, estado: string, edicoes: Record<string, unknown>): void {
  try {
    sessionStorage.setItem(chaveDasEdicoes(id, estado), serializar(edicoes));
  } catch {
    // Sem armazenamento, as edições valem só até recarregar.
  }
}

function apagarEdicoes(id: string, estado: string): void {
  try {
    sessionStorage.removeItem(chaveDasEdicoes(id, estado));
  } catch {
    // Nada a apagar.
  }
}
