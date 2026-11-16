import type { EnvironmentProviders, Provider, Type } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NEVER, Observable, delay, of, switchMap, throwError, timer } from 'rxjs';

import type { TipoCampo } from '../modelo/tipos';

export interface Limite {
  min?: number;
  max?: number;
}

/**
 * Um estado do componente, como ele aparece para o usuário: depende dos dados recebidos
 * (inputs), da resposta dos serviços (provedores) e do que o usuário fez (ação).
 * Ex.: lista carregando, vazia, "Nenhum resultado encontrado", erro ao carregar; card por status.
 */
export interface Estado<C = any> {
  /** Regra de negócio ou situação que o estado representa; aparece na área de teste. */
  descricao?: string;
  /** Valores dos inputs, pelo nome público. Use uma função quando o valor precisa ser novo a cada vez (ex.: FormGroup). */
  inputs?: Record<string, unknown> | (() => Record<string, unknown>);
  /** Serviços e rota simulados só neste estado (ver `simularServico` e `simularRota`). */
  provedores?: (Provider | EnvironmentProviders)[];
  /** O que o usuário faz depois que o componente aparece (ex.: aplicar um filtro sem resultado). */
  acao?: (componente: C) => void | Promise<void>;
}

/** Conteúdo de um arquivo `<componente>.proto.ts` (ver docs/prototipador/02-area-de-teste.md). */
export interface Ajuste<C = any> {
  /** Largura do contêiner no palco: número em px ou texto CSS. */
  largura?: number | string;
  /** Nome do estado → definição. O primeiro é o inicial. */
  estados?: Record<string, Estado<C>>;
  /** Forma curta: nome → só os valores dos inputs. Vem depois dos `estados`. */
  variacoes?: Record<string, Record<string, unknown>>;
  /** Caminho (`branch.descricao`, `itens[].nome`) → tamanhos esperados. Nunca bloqueia a digitação. */
  limites?: Record<string, Limite>;
  /** Caminho → tipo de campo, para corrigir um input que o gerador marcou como não editável. */
  tipos?: Record<string, TipoCampo>;
  /** Dependências que valem para todos os estados. */
  provedores?: (Provider | EnvironmentProviders)[];
  /** Conteúdo projetado, para componentes com `<ng-content>`. */
  conteudo?: string;
}

/**
 * Só devolve o ajuste que recebe. Existe para dar tipagem (a `acao` recebe o componente certo)
 * e um ponto único de leitura.
 */
export function ajustar<C>(componente: Type<C>, ajuste: Ajuste<C>): Ajuste<C> {
  return ajuste;
}

// ---------- Respostas simuladas ----------

/** Espera de uma chamada real, para os estados de carregamento aparecerem. */
const ESPERA_PADRAO_MS = 400;

/** O serviço responde com sucesso. */
export function responder<T>(valor: T, espera = ESPERA_PADRAO_MS): Observable<T> {
  return of(valor).pipe(delay(espera));
}

/** O serviço responde com erro (o erro pode ser uma classe do próprio projeto). */
export function falhar(erro: unknown = new Error('Erro simulado pelo prototipador'), espera = ESPERA_PADRAO_MS): Observable<never> {
  return timer(espera).pipe(switchMap(() => throwError(() => erro)));
}

/** O serviço nunca responde: o componente fica no estado de carregamento. */
export function semResposta(): Observable<never> {
  return NEVER;
}

/** Usa o serviço real, trocando só os métodos informados. */
export function simularServico<T extends object>(servico: Type<T>, metodos: { [K in keyof T]?: T[K] }): Provider {
  return { provide: servico, useFactory: () => Object.assign(new servico(), metodos) };
}

/** Rota com parâmetros (`:codigo`) e consulta (`?aba=`), para páginas que leem a URL. */
export function simularRota(parametros: Record<string, string> = {}, consulta: Record<string, string> = {}): Provider {
  const paramMap = convertToParamMap(parametros);
  const queryParamMap = convertToParamMap(consulta);
  return {
    provide: ActivatedRoute,
    useValue: {
      paramMap: of(paramMap),
      queryParamMap: of(queryParamMap),
      params: of(parametros),
      queryParams: of(consulta),
      snapshot: { paramMap, queryParamMap, params: parametros, queryParams: consulta },
    },
  };
}
