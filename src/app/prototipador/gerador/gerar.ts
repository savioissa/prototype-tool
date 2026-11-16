import { join, resolve } from 'node:path';
import type { CompilerOptions } from 'ts-morph';

import type { SchemaGerado, TagsGeradas } from '../modelo/tipos';
import { LeituraDeComponentes, lerComponentes } from './componentes/ler-componentes';
import { lerDados } from './dados/ler-dados';
import { PASTA_PROTOTIPADOR, Telas, abrirTelas } from './projeto';
import { lerTags } from './traducoes/ler-tags';
import { Configuracao, lerConfiguracao } from './configuracao';
import { escreverSeMudou, textoDasTags, textoDoSchema, textoDosComponentes } from './escrita';

export interface OpcoesDeGeracao {
  /** Usada no lugar do prototipador.config.json da raiz. */
  configuracao?: Configuracao;
  /** Pasta dos arquivos gerados; padrão: src/app/prototipador/gerado. */
  saida?: string;
  /** Sobrepõe opções do tsconfig do projeto (ex.: onde achar node_modules). */
  opcoesDoCompilador?: CompilerOptions;
}

export interface Resumo {
  componentes: number;
  entidades: number;
  tags: number;
  avisos: number;
  milissegundos: number;
  /** Arquivos gerados que mudaram nesta geração. */
  alterados: string[];
}

export function gerar(raiz: string, opcoes: OpcoesDeGeracao = {}): Resumo {
  const inicio = performance.now();
  const configuracao = opcoes.configuracao ?? lerConfiguracao(raiz);
  const pastaDoPrototipador = resolve(raiz, PASTA_PROTOTIPADOR);
  const saida = opcoes.saida ?? join(pastaDoPrototipador, 'gerado');
  const modelo = join(pastaDoPrototipador, 'modelo', 'tipos');

  // Nunca interrompe: uma falha inesperada vira aviso e os arquivos são escritos mesmo assim.
  const falha = (parte: string, erro: unknown) => `Falha inesperada ao ler ${parte}: ${(erro as Error).stack ?? erro}`;
  let telas: Telas;
  try {
    telas = abrirTelas(raiz, configuracao, opcoes.opcoesDoCompilador);
  } catch (erro) {
    telas = { projeto: null!, arquivos: [], avisos: [falha('as telas', erro)] };
  }

  let leitura: LeituraDeComponentes;
  try {
    leitura = lerComponentes(raiz, configuracao, opcoes.opcoesDoCompilador, telas);
  } catch (erro) {
    leitura = { componentes: [], templates: [], avisos: [falha('os componentes', erro)] };
  }

  let schema: SchemaGerado;
  try {
    schema = lerDados(raiz, configuracao, telas);
  } catch (erro) {
    schema = { entidades: [], relacionamentos: [], avisos: [falha('os dados', erro)] };
  }

  let tags: TagsGeradas;
  try {
    tags = lerTags(raiz, configuracao, telas, leitura);
  } catch (erro) {
    tags = { tags: [], dinamicas: [], planilhaDisponivel: false, avisos: [falha('as tags de tradução', erro)] };
  }

  const arquivos: [string, string][] = [
    ['componentes.gerado.ts', textoDosComponentes(leitura.componentes, leitura.avisos, raiz, saida, modelo)],
    ['schema.gerado.ts', textoDoSchema(schema, saida, modelo)],
    ['tags.gerado.ts', textoDasTags(tags, saida, modelo)],
  ];
  const alterados = arquivos.filter(([nome, texto]) => escreverSeMudou(join(saida, nome), texto)).map(([nome]) => nome);

  // Um arquivo com erro aparece nos avisos de componentes e de dados; conta uma vez só.
  const avisos = new Set([
    ...leitura.avisos,
    ...leitura.componentes.flatMap((componente) => componente.avisos.map((aviso) => `${componente.id}: ${aviso}`)),
    ...schema.avisos,
    ...tags.avisos,
  ]).size;

  return {
    componentes: leitura.componentes.length,
    entidades: schema.entidades.length,
    tags: tags.tags.length,
    avisos,
    milissegundos: Math.round(performance.now() - inicio),
    alterados,
  };
}

export function linhaDoResumo(resumo: Resumo): string {
  const alteracao = resumo.alterados.length ? `atualizado: ${resumo.alterados.join(', ')}` : 'sem alterações';
  return (
    `[proto] ${resumo.componentes} componentes · ${resumo.entidades} entidades · ` +
    `${resumo.tags} tags · ${resumo.avisos} avisos · ${resumo.milissegundos}ms (${alteracao})`
  );
}
