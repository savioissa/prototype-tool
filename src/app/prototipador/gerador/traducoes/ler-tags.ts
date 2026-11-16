import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { CallExpression, NoSubstitutionTemplateLiteral, Node, StringLiteral } from 'ts-morph';

import type { ChaveDinamica, TagUsada, TagsGeradas, UsoDeTag } from '../../modelo/tipos';
import type { LeituraDeComponentes } from '../componentes/ler-componentes';
import { lerTagsDoTemplate } from '../componentes/template';
import type { Configuracao } from '../configuracao';
import { Telas, posix } from '../projeto';
import { lerPlanilha } from './planilha';

/** Ver docs/prototipador/04-traducoes.md e 05-gerador.md, "Leitura das tags". */

const TAMANHO_DO_TRECHO = 160;
const METODOS_DE_TRADUCAO = new Set(['instant', 'get', 'stream']);
const PAPEL_PROVAVEL = 'texto no código (uso provável)';

type Idioma = 'pt' | 'en' | 'es';

export function lerTags(raiz: string, config: Configuracao, telas: Telas, componentes: LeituraDeComponentes): TagsGeradas {
  const avisos: string[] = [];
  const usos = new Map<string, UsoDeTag[]>();
  const dinamicas: ChaveDinamica[] = [];
  const caminho = (absoluto: string) => posix(relative(raiz, absoluto));
  const linhasDe = memorizar((absoluto: string) => readFileSync(absoluto, 'utf8').split(/\r?\n/));
  const trecho = (absoluto: string, linha: number) => (linhasDe(absoluto)[linha - 1] ?? '').trim().slice(0, TAMANHO_DO_TRECHO);
  const adicionar = (chave: string, uso: UsoDeTag) => usos.set(chave, [...(usos.get(chave) ?? []), uso]);

  // Textos dos arquivos i18n, com chaves aninhadas achatadas em caminhos com ponto.
  const textos: Record<Idioma, Map<string, string>> = { pt: new Map(), en: new Map(), es: new Map() };
  for (const idioma of ['pt', 'en', 'es'] as const) {
    const nome = config.i18n.idiomas[idioma];
    if (!nome) {
      avisos.push(`i18n.idiomas não define o arquivo de "${idioma}".`);
      continue;
    }
    const arquivo = resolve(raiz, config.i18n.pasta, nome);
    try {
      achatar(JSON.parse(readFileSync(arquivo, 'utf8')), '', textos[idioma]);
    } catch (erro) {
      avisos.push(`${caminho(arquivo)}: não foi possível ler (${(erro as Error).message}).`);
    }
  }
  const chavesDosArquivos = new Set([...textos.pt.keys(), ...textos.en.keys(), ...textos.es.keys()]);

  // 1. Templates
  for (const template of componentes.templates) {
    let lidos;
    try {
      lidos = lerTagsDoTemplate(template.texto, template.arquivo, config.traducao.pipe);
    } catch (erro) {
      avisos.push(`${caminho(template.arquivo)}: não foi possível ler as tags do template (${(erro as Error).message}).`);
      continue;
    }
    for (const lido of lidos) {
      const linha = template.linhaInicial + lido.linha + 1;
      const base = { componente: template.id, arquivo: caminho(template.arquivo), linha, papel: lido.papel, condicao: lido.condicao, trecho: trecho(template.arquivo, linha) };
      if (lido.chave === null) {
        dinamicas.push({ ...base, expressao: lido.expressao });
      } else {
        adicionar(lido.chave, { ...base, provavel: false });
      }
    }
  }

  // 2. Código: chamadas ao serviço de tradução e textos fixos idênticos a uma chave.
  const componentesPorArquivo = new Map<string, { id: string; classe: string }[]>();
  for (const c of componentes.componentes) {
    // Mesma forma de caminho do ts-morph (barras normais), para casar com getFilePath().
    const absoluto = posix(resolve(raiz, c.arquivo));
    componentesPorArquivo.set(absoluto, [...(componentesPorArquivo.get(absoluto) ?? []), { id: c.id, classe: c.classe }]);
  }
  const quemUsa = criarBuscaDeComponentes(componentesPorArquivo);

  for (const arquivo of telas.arquivos) {
    const absoluto = arquivo.getFilePath();
    const jaLidos = new Set<number>();

    for (const chamada of arquivo.getDescendants().filter(Node.isCallExpression)) {
      if (!ehChamadaDeTraducao(chamada, config.traducao.servico)) continue;
      const argumento = chamada.getArguments()[0];
      if (!argumento) continue;
      const fixas = textosFixos(argumento);
      const linha = argumento.getStartLineNumber();
      const papel = papelNoCodigo(chamada);
      for (const componente of quemUsa(chamada)) {
        const base = { componente, arquivo: caminho(absoluto), linha, papel, condicao: null, trecho: trecho(absoluto, linha) };
        if (fixas) {
          fixas.forEach(({ chave }) => adicionar(chave, { ...base, provavel: false }));
        } else {
          dinamicas.push({ ...base, expressao: argumento.getText() });
        }
      }
      fixas?.forEach(({ no }) => jaLidos.add(no.getStart()));
    }

    // Uso provável: qualquer texto fixo do código igual a uma chave dos arquivos i18n.
    for (const literal of arquivo.getDescendants().filter(ehTextoFixo)) {
      const chave = literal.getLiteralText();
      if (!chavesDosArquivos.has(chave) || jaLidos.has(literal.getStart())) continue;
      const linha = literal.getStartLineNumber();
      for (const componente of quemUsa(literal)) {
        adicionar(chave, { componente, arquivo: caminho(absoluto), linha, papel: PAPEL_PROVAVEL, condicao: null, trecho: trecho(absoluto, linha), provavel: true });
      }
    }
  }

  // 3. Planilha
  const planilha = lerPlanilha(resolve(raiz, config.planilha.arquivo), config.planilha.colunaChave, config.planilha.arquivo);
  if (planilha.aviso) avisos.push(planilha.aviso);

  const ordenarUsos = (a: UsoDeTag, b: UsoDeTag) =>
    a.componente.localeCompare(b.componente) || a.arquivo.localeCompare(b.arquivo) || a.linha - b.linha || a.papel.localeCompare(b.papel);
  const tags: TagUsada[] = [...usos.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, lista]) => ({
      chave,
      textos: Object.fromEntries((['pt', 'en', 'es'] as const).filter((i) => textos[i].has(chave)).map((i) => [i, textos[i].get(chave)!])),
      naPlanilha: planilha.disponivel ? planilha.chaves.has(chave) : null,
      usos: semRepetir(lista).sort(ordenarUsos),
    }));

  return {
    tags,
    dinamicas: dinamicas.sort((a, b) => a.componente.localeCompare(b.componente) || a.arquivo.localeCompare(b.arquivo) || a.linha - b.linha),
    planilhaDisponivel: planilha.disponivel,
    avisos,
  };
}

// ---------- Código TypeScript ----------

/** `x.instant(...)`, `x.get(...)` ou `x.stream(...)` num objeto do tipo do serviço de tradução. */
function ehChamadaDeTraducao(chamada: CallExpression, servico: string): boolean {
  const expressao = chamada.getExpression();
  if (!Node.isPropertyAccessExpression(expressao) || !METODOS_DE_TRADUCAO.has(expressao.getName())) return false;
  const tipo = expressao.getExpression().getType();
  return (tipo.getSymbol() ?? tipo.getAliasSymbol())?.getName() === servico;
}

/** Texto fixo ou lista de textos fixos; null quando a chave é montada no código. */
function textosFixos(argumento: Node): { chave: string; no: Node }[] | null {
  if (ehTextoFixo(argumento)) {
    return [{ chave: argumento.getLiteralText(), no: argumento }];
  }
  if (Node.isArrayLiteralExpression(argumento)) {
    const itens = argumento.getElements();
    if (itens.every(ehTextoFixo)) {
      return itens.map((i) => ({ chave: i.getLiteralText(), no: i }));
    }
  }
  return null;
}

function ehTextoFixo(no: Node): no is StringLiteral | NoSubstitutionTemplateLiteral {
  return Node.isStringLiteral(no) || Node.isNoSubstitutionTemplateLiteral(no);
}

/** Aviso (toast), diálogo de confirmação ou texto montado no código, com a propriedade quando houver. */
function papelNoCodigo(no: Node): string {
  let propriedade: string | null = null;
  for (let atual: Node | undefined = no.getParent(); atual; atual = atual.getParent()) {
    if (!propriedade && Node.isPropertyAssignment(atual)) propriedade = atual.getName();
    if (Node.isCallExpression(atual)) {
      const chamada = atual.getExpression();
      if (Node.isPropertyAccessExpression(chamada)) {
        const tipo = chamada.getExpression().getType().getSymbol()?.getName();
        if (chamada.getName() === 'add' && tipo === 'MessageService') return comPropriedade('mensagem de aviso (toast)', propriedade);
        if (chamada.getName() === 'confirm' && tipo === 'ConfirmationService') return comPropriedade('diálogo de confirmação', propriedade);
      }
    }
    if (Node.isObjectLiteralExpression(atual)) {
      const contexto = atual.getContextualType()?.getSymbol()?.getName() ?? atual.getContextualType()?.getAliasSymbol()?.getName();
      if (contexto === 'Confirmation') return comPropriedade('diálogo de confirmação', propriedade);
      if (contexto === 'Message') return comPropriedade('mensagem de aviso (toast)', propriedade);
    }
    if (Node.isMethodDeclaration(atual) || Node.isFunctionDeclaration(atual) || Node.isGetAccessorDeclaration(atual)) {
      return `texto montado no código, em ${atual.getName() ?? '(anônimo)'}()`;
    }
  }
  return 'texto montado no código';
}

function comPropriedade(papel: string, propriedade: string | null): string {
  return propriedade ? `${papel} · ${propriedade}` : papel;
}

/**
 * Componentes a quem um trecho do código pertence: a classe do componente que o contém, ou,
 * fora de um componente (modelo, utilitário), os componentes que usam a declaração de topo.
 */
function criarBuscaDeComponentes(componentesPorArquivo: Map<string, { id: string; classe: string }[]>): (no: Node) => string[] {
  const cache = new Map<Node, string[]>();
  return (no) => {
    const arquivo = no.getSourceFile().getFilePath();
    const doArquivo = componentesPorArquivo.get(arquivo) ?? [];
    const classe = no.getFirstAncestor(Node.isClassDeclaration)?.getName();
    const daClasse = doArquivo.find((c) => c.classe === classe);
    if (daClasse) return [daClasse.id];
    if (doArquivo.length) return doArquivo.map((c) => c.id);

    const topo = declaracaoDeTopo(no);
    if (!topo) return [''];
    if (!cache.has(topo)) {
      const ids = componentesQueReferenciam(topo, new Set());
      cache.set(topo, ids.size ? [...ids].sort() : ['']);
    }
    return cache.get(topo)!;
  };

  /** Segue as referências: um utilitário usado por outro utilitário chega aos componentes deste. */
  function componentesQueReferenciam(topo: Node, visitados: Set<Node>): Set<string> {
    const ids = new Set<string>();
    if (visitados.has(topo)) return ids;
    visitados.add(topo);
    const nomeavel = Node.isVariableStatement(topo) ? topo.getDeclarations()[0] : topo;
    const referencias = Node.isReferenceFindable(nomeavel) ? nomeavel.findReferencesAsNodes() : [];
    for (const referencia of referencias) {
      const daReferencia = componentesPorArquivo.get(referencia.getSourceFile().getFilePath()) ?? [];
      if (daReferencia.length) {
        const classeDaReferencia = referencia.getFirstAncestor(Node.isClassDeclaration)?.getName();
        const exata = daReferencia.find((c) => c.classe === classeDaReferencia);
        (exata ? [exata] : daReferencia).forEach((c) => ids.add(c.id));
      } else {
        const outroTopo = declaracaoDeTopo(referencia);
        if (outroTopo && outroTopo !== topo) componentesQueReferenciam(outroTopo, visitados).forEach((id) => ids.add(id));
      }
    }
    return ids;
  }
}

function declaracaoDeTopo(no: Node): Node | undefined {
  let atual: Node | undefined = no;
  while (atual && !Node.isSourceFile(atual.getParent() ?? atual)) {
    atual = atual.getParent();
  }
  return atual && !Node.isSourceFile(atual) ? atual : undefined;
}

// ---------- Utilitários ----------

function achatar(valor: unknown, prefixo: string, destino: Map<string, string>): void {
  if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
    for (const [chave, item] of Object.entries(valor)) {
      achatar(item, prefixo ? `${prefixo}.${chave}` : chave, destino);
    }
  } else if (prefixo && (typeof valor === 'string' || typeof valor === 'number')) {
    destino.set(prefixo, String(valor));
  }
}

function semRepetir(usos: UsoDeTag[]): UsoDeTag[] {
  const vistos = new Set<string>();
  return usos.filter((u) => {
    const chave = `${u.componente}|${u.arquivo}|${u.linha}|${u.papel}`;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

function memorizar<T>(funcao: (chave: string) => T): (chave: string) => T {
  const cache = new Map<string, T>();
  return (chave) => {
    if (!cache.has(chave)) cache.set(chave, funcao(chave));
    return cache.get(chave)!;
  };
}
