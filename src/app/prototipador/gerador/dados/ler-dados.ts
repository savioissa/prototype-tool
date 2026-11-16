import { basename, relative } from 'node:path';
import { Node, Type, ts } from 'ts-morph';

import type { Atributo, Entidade, Relacionamento, SchemaGerado, TipoObservado } from '../../modelo/tipos';
import type { Configuracao } from '../configuracao';
import { NAO_LITERAL, valorLiteral } from '../literais';
import { Telas, posix } from '../projeto';

/**
 * Infere o schema a partir das telas (ver docs/prototipador/03-dados.md, adaptado):
 * - entidades: os tipos que os serviços das telas devolvem e os tipos das constantes de dados;
 * - atributos e relacionamentos estruturais: a declaração desses tipos;
 * - registros, exemplos, opcionais e referências confirmadas: os valores fixos das constantes
 *   (lidos sem executar o código).
 */

type Registro = Record<string, unknown>;

interface EntidadeEmMontagem {
  nome: string;
  origens: { arquivo: string; exportacao: string }[];
  /** Tipo declarado; ausente quando a entidade vem de um mock sem anotação. */
  tipo: Type | null;
  local: Node | null;
  registros: Registro[];
}

interface Agrupamento {
  entidade: string;
  campo: string;
  chaves: string[];
}

const TAMANHO_DO_EXEMPLO = 40;
const SEMELHANCA_MINIMA = 0.8;

export function lerDados(raiz: string, config: Configuracao, telas: Telas): SchemaGerado {
  const avisos: string[] = [];
  const caminhosDasTelas = new Set(telas.arquivos.map((arquivo) => arquivo.getFilePath()));
  const entidades = new Map<string, EntidadeEmMontagem>();
  const agrupamentos: Agrupamento[] = [];
  const caminho = (no: Node) => posix(relative(raiz, no.getSourceFile().getFilePath()));
  const ehMock = criarTesteDeMock(config.mocks);

  const registrar = (nome: string, tipo: Type | null, local: Node | null, origem?: { arquivo: string; exportacao: string }) => {
    let entidade = entidades.get(nome);
    if (!entidade) {
      entidade = { nome, origens: [], tipo, local, registros: [] };
      entidades.set(nome, entidade);
    }
    if (!entidade.tipo && tipo) {
      entidade.tipo = tipo;
      entidade.local = local;
    }
    if (origem && !entidade.origens.some((o) => o.arquivo === origem.arquivo && o.exportacao === origem.exportacao)) {
      entidade.origens.push(origem);
    }
    return entidade;
  };

  /** O tipo é uma entidade quando é um objeto com nome, declarado nas telas (não é serviço nem componente). */
  const entidadeDoTipo = (tipo: Type): { nome: string; tipo: Type; declaracao: Node } | null => {
    const objeto = desembrulhar(tipo);
    if (!objeto.isObject() || objeto.isArray() || objeto.getCallSignatures().length > 0) {
      return null;
    }
    const simbolo = objeto.getAliasSymbol() ?? objeto.getSymbol();
    const declaracao = simbolo
      ?.getDeclarations()
      .find((d) => Node.isInterfaceDeclaration(d) || Node.isTypeAliasDeclaration(d) || Node.isClassDeclaration(d));
    if (!simbolo || !declaracao || !caminhosDasTelas.has(declaracao.getSourceFile().getFilePath())) {
      return null;
    }
    if (Node.isClassDeclaration(declaracao) && (declaracao.getDecorators().length > 0 || herdaDeErro(objeto))) {
      return null;
    }
    return { nome: simbolo.getName(), tipo: objeto, declaracao };
  };

  // 1. O que os serviços das telas devolvem.
  for (const arquivo of telas.arquivos) {
    for (const classe of arquivo.getClasses()) {
      if (!classe.getDecorator('Injectable')) {
        continue;
      }
      for (const metodo of classe.getMethods()) {
        if (metodo.hasModifier(ts.SyntaxKind.PrivateKeyword) || metodo.hasModifier(ts.SyntaxKind.ProtectedKeyword) || metodo.isStatic()) {
          continue;
        }
        const encontrada = entidadeDoTipo(metodo.getReturnType());
        if (encontrada) {
          registrar(encontrada.nome, encontrada.tipo, encontrada.declaracao, {
            arquivo: caminho(metodo),
            exportacao: `${classe.getName()}.${metodo.getName()}()`,
          });
        }
      }
    }
  }

  // 2. As constantes de dados: listas de objetos, objetos e listas agrupadas por chave.
  for (const arquivo of telas.arquivos) {
    for (const declaracao of arquivo.getVariableDeclarations()) {
      const inicial = declaracao.getInitializer();
      if (!inicial || !Node.isSourceFile(declaracao.getVariableStatement()?.getParent() ?? inicial)) {
        continue;
      }
      const nomeDaConstante = declaracao.getName();
      const origem = { arquivo: caminho(declaracao), exportacao: nomeDaConstante };
      const valor = valorLiteral(inicial);
      const tipoDeclarado = declaracao.getType();

      if (valor === NAO_LITERAL) {
        const encontrada = entidadeDoTipo(tipoDeclarado);
        if (encontrada) {
          avisos.push(`${origem.arquivo}: ${nomeDaConstante} não é feito só de valores fixos; os registros não foram lidos.`);
        }
        continue;
      }

      const lista = listaDeObjetos(valor);
      const grupos = !lista && objetoDeListas(valor);
      const objeto = !lista && !grupos && ehObjetoSimples(valor) ? [valor as Registro] : null;
      const registros = lista ?? (grupos ? Object.values(grupos).flat() : objeto);
      if (!registros?.length) {
        continue;
      }

      const tipoDoItem = grupos ? (tipoDeclarado.getStringIndexType() ?? tipoDeclarado.getProperties()[0]?.getTypeAtLocation(declaracao)) : tipoDeclarado;
      const encontrada = tipoDoItem ? entidadeDoTipo(tipoDoItem) : null;
      let nome = encontrada?.nome;
      // Sem tipo com nome, só os mocks viram entidade (pelo nome do export, como na especificação).
      if (!nome && ehMock(arquivo.getFilePath())) {
        nome = nomePeloExport(nomeDaConstante);
      }
      if (!nome) {
        continue;
      }
      const entidade = registrar(nome, encontrada?.tipo ?? null, encontrada?.declaracao ?? null, origem);
      entidade.registros.push(...registros);
      if (grupos) {
        agrupamentos.push({ entidade: nome, campo: nomeDaConstante, chaves: Object.keys(grupos) });
      }
    }
  }

  // O mesmo registro pode aparecer em várias constantes (ex.: um almoxarifado em várias filiais).
  for (const entidade of entidades.values()) {
    entidade.registros = semRepetidos(entidade.registros);
  }

  // 3. Atributos e relacionamentos estruturais. Objetos aninhados podem criar entidades novas.
  const prontas = new Map<string, Entidade>();
  const relacionamentos: Relacionamento[] = [];
  const pendentes = [...entidades.keys()];
  while (pendentes.length) {
    const nome = pendentes.shift()!;
    if (prontas.has(nome)) {
      continue;
    }
    const entidade = entidades.get(nome)!;
    const atributos: Atributo[] = [];
    const aninhar = (campo: string, alvo: EntidadeEmMontagem, lista: boolean) => {
      relacionamentos.push({
        de: nome,
        para: alvo.nome,
        cardinalidade: lista ? '1:N' : '1:1',
        regra: lista ? 'listaAninhada' : 'aninhado',
        campo,
        confianca: 'alta',
      });
      if (!prontas.has(alvo.nome)) {
        pendentes.push(alvo.nome);
      }
    };

    for (const campo of camposDe(entidade)) {
      const valores = entidade.registros.map((registro) => registro[campo.nome]);
      const objetosNosDados = valores.flatMap((v) => (Array.isArray(v) ? v : [v])).filter(ehObjetoSimples) as Registro[];

      if (campo.forma === 'objeto' || campo.forma === 'listaDeObjetos' || (!campo.tipo && objetosNosDados.length)) {
        const lista = campo.forma === 'listaDeObjetos' || valores.some(Array.isArray);
        const declarada = campo.tipo ? entidadeDoTipo(campo.tipo) : null;
        const alvo = declarada
          ? registrar(declarada.nome, declarada.tipo, declarada.declaracao)
          : entidadeParaObjetos(nome, campo.nome, objetosNosDados, campo.tipo, entidade.local, entidades, prontas);
        alvo.registros = semRepetidos([...alvo.registros, ...objetosNosDados]);
        aninhar(campo.nome, alvo, lista);
        continue;
      }
      if (campo.forma === 'ignorar') {
        continue;
      }

      // Os valores mandam (ex.: texto com datas ISO é data); sem valores, vale o tipo declarado.
      const observados = new Set(
        valores.flatMap((v) => (Array.isArray(v) ? v : [v])).map(tipoObservado).filter((t): t is TipoObservado => !!t),
      );
      const tipos = observados.size ? observados : new Set<TipoObservado>(campo.tiposDeclarados);
      const exemplo = valores.find((v) => v !== null && v !== undefined);
      atributos.push({
        nome: campo.nome,
        tipos: [...tipos],
        ...(campo.forma === 'listaSimples' || valores.some(Array.isArray) ? { lista: true } : {}),
        opcional: campo.opcional || valores.some((v) => v === null || v === undefined),
        exemplo: exemplo === undefined ? null : resumirExemplo(exemplo),
        marca: null,
      });
    }

    prontas.set(nome, {
      nome,
      origens: [...entidade.origens].sort((a, b) => (a.arquivo + a.exportacao < b.arquivo + b.exportacao ? -1 : 1)),
      registros: entidade.registros.length,
      atributos,
    });
  }

  // 4. Chave primária: `id`; sem `id`, `codigo`/`code` quando os dados mostram valores únicos.
  const chaves = new Map<string, { atributo: string; valores: Set<unknown> }>();
  for (const entidade of prontas.values()) {
    const registros = entidades.get(entidade.nome)!.registros;
    const candidato =
      entidade.atributos.find((a) => a.nome === 'id') ??
      entidade.atributos.find((a) => (a.nome === 'codigo' || a.nome === 'code') && valoresUnicos(registros, a.nome));
    if (candidato) {
      candidato.marca = 'PK';
      chaves.set(entidade.nome, { atributo: candidato.nome, valores: new Set(registros.map((r) => r[candidato.nome])) });
    }
  }

  // 5. Referências: pelo nome (`<x>Id`, `<x>Ids`) e pelos valores (todos existem na chave de outra entidade).
  const porNomeMinusculo = new Map([...prontas.keys()].map((nome) => [nome.toLowerCase(), nome]));
  for (const entidade of prontas.values()) {
    const registros = entidades.get(entidade.nome)!.registros;
    for (const atributo of entidade.atributos) {
      if (atributo.marca === 'PK') {
        continue;
      }
      const valores = registros
        .flatMap((r) => (Array.isArray(r[atributo.nome]) ? (r[atributo.nome] as unknown[]) : [r[atributo.nome]]))
        .filter((v) => v !== null && v !== undefined);

      const pelaRegra = destinoPeloNome(atributo.nome, porNomeMinusculo);
      if (pelaRegra) {
        const chave = chaves.get(pelaRegra.destino);
        const confirmada = !!chave && valores.length > 0 && valores.every((v) => chave.valores.has(v));
        relacionamentos.push({
          de: entidade.nome,
          para: pelaRegra.destino,
          cardinalidade: pelaRegra.lista ? 'N:N' : 'N:1',
          regra: pelaRegra.lista ? 'listaDeReferencias' : 'referencia',
          campo: atributo.nome,
          confianca: confirmada ? 'alta' : 'baixa',
        });
        atributo.marca = 'FK';
        continue;
      }

      // Pelos valores: só texto, para números pequenos não casarem por acaso.
      if (!valores.length || !valores.every((v) => typeof v === 'string')) {
        continue;
      }
      const destino = [...chaves.entries()].find(
        ([nome, chave]) => nome !== entidade.nome && valores.every((v) => chave.valores.has(v)),
      );
      if (destino) {
        relacionamentos.push({
          de: entidade.nome,
          para: destino[0],
          cardinalidade: atributo.lista ? 'N:N' : 'N:1',
          regra: atributo.lista ? 'listaDeReferencias' : 'referencia',
          campo: atributo.nome,
          confianca: 'alta',
        });
        atributo.marca = 'FK';
      }
    }
  }

  // 6. Agrupamentos: listas guardadas pela chave de outra entidade (ex.: almoxarifados por filial).
  for (const grupo of agrupamentos) {
    const destino = [...chaves.entries()].find(
      ([nome, chave]) => nome !== grupo.entidade && grupo.chaves.every((c) => chave.valores.has(c)),
    );
    if (destino) {
      relacionamentos.push({
        de: destino[0],
        para: grupo.entidade,
        cardinalidade: '1:N',
        regra: 'agrupamento',
        campo: grupo.campo,
        confianca: 'alta',
      });
    }
  }

  const unicos = new Map(relacionamentos.map((r) => [`${r.de}|${r.para}|${r.regra}|${r.campo}`, r]));
  return {
    entidades: [...prontas.values()].sort((a, b) => a.nome.localeCompare(b.nome)),
    relacionamentos: [...unicos.values()].sort((a, b) =>
      `${a.de}|${a.para}|${a.campo}`.localeCompare(`${b.de}|${b.para}|${b.campo}`),
    ),
    avisos: [...telas.avisos, ...avisos],
  };
}

// ---------- Campos de uma entidade ----------

interface CampoDaEntidade {
  nome: string;
  forma: 'simples' | 'listaSimples' | 'objeto' | 'listaDeObjetos' | 'ignorar';
  tiposDeclarados: TipoObservado[];
  opcional: boolean;
  /** Tipo declarado do campo (sem nulo); null quando só há dados. */
  tipo: Type | null;
}

/** Campos pela declaração do tipo; sem tipo, pelas chaves que aparecem nos registros. */
function camposDe(entidade: EntidadeEmMontagem): CampoDaEntidade[] {
  if (entidade.tipo && entidade.local) {
    return entidade.tipo.getProperties().map((propriedade) => {
      const tipoCompleto = propriedade.getTypeAtLocation(entidade.local!);
      const opcional =
        propriedade.hasFlags(ts.SymbolFlags.Optional) ||
        (tipoCompleto.isUnion() && tipoCompleto.getUnionTypes().some((t) => t.isNull() || t.isUndefined()));
      const tipo = semNulos(tipoCompleto);
      return { nome: propriedade.getName(), opcional, tipo, ...classificar(tipo) };
    });
  }
  const nomes = [...new Set(entidade.registros.flatMap((registro) => Object.keys(registro)))];
  return nomes.map((nome) => ({ nome, forma: 'simples', tiposDeclarados: [], opcional: false, tipo: null }));
}

function classificar(tipo: Type): Pick<CampoDaEntidade, 'forma' | 'tiposDeclarados'> {
  const primitivos = tiposPrimitivos(tipo);
  if (primitivos) {
    return { forma: 'simples', tiposDeclarados: primitivos };
  }
  if (tipo.isArray()) {
    const item = semNulos(tipo.getArrayElementTypeOrThrow());
    const doItem = tiposPrimitivos(item);
    if (doItem) {
      return { forma: 'listaSimples', tiposDeclarados: doItem };
    }
    return ehObjetoDeDados(item) ? { forma: 'listaDeObjetos', tiposDeclarados: [] } : { forma: 'ignorar', tiposDeclarados: [] };
  }
  return ehObjetoDeDados(tipo) ? { forma: 'objeto', tiposDeclarados: [] } : { forma: 'ignorar', tiposDeclarados: [] };
}

/** texto, número, booleano, data, uniões de literais e enums; null para o resto. */
function tiposPrimitivos(tipo: Type): TipoObservado[] | null {
  const membros = tipo.isUnion() && !tipo.isBoolean() ? tipo.getUnionTypes() : [tipo];
  const tipos = new Set<TipoObservado>();
  for (const membro of membros) {
    if (membro.isNull() || membro.isUndefined()) continue;
    if (membro.isString() || membro.isStringLiteral() || membro.isTemplateLiteral()) tipos.add('texto');
    else if (membro.isNumber() || membro.isNumberLiteral()) tipos.add('numero');
    else if (membro.isBoolean() || membro.isBooleanLiteral()) tipos.add('booleano');
    else if (membro.getSymbol()?.getName() === 'Date') tipos.add('data');
    else if (membro.isEnumLiteral() || membro.isEnum()) tipos.add(typeof membro.getLiteralValue() === 'number' ? 'numero' : 'texto');
    else return null;
  }
  return [...tipos];
}

/** Objeto com propriedades de dado: sem métodos, sem ser lista, função ou dicionário livre. */
function ehObjetoDeDados(tipo: Type): boolean {
  if (!tipo.isObject() || tipo.isArray() || tipo.getCallSignatures().length > 0) {
    return false;
  }
  const propriedades = tipo.getProperties();
  return (
    propriedades.length > 0 &&
    !propriedades.some((p) => p.getDeclarations().some((d) => Node.isMethodDeclaration(d) || Node.isMethodSignature(d)))
  );
}

/** Entidade para objetos aninhados sem tipo com nome: uma existente com 80% dos atributos, ou `<Pai>.<campo>`. */
function entidadeParaObjetos(
  pai: string,
  campo: string,
  objetos: Registro[],
  tipo: Type | null,
  local: Node | null,
  entidades: Map<string, EntidadeEmMontagem>,
  prontas: Map<string, Entidade>,
): EntidadeEmMontagem {
  const chaves = tipo && local
    ? tipo.getProperties().map((p) => p.getName())
    : [...new Set(objetos.flatMap((o) => Object.keys(o)))];
  for (const existente of prontas.values()) {
    const nomes = new Set(existente.atributos.map((a) => a.nome));
    const comuns = chaves.filter((c) => nomes.has(c)).length;
    if (chaves.length && comuns / Math.max(chaves.length, nomes.size) >= SEMELHANCA_MINIMA) {
      return entidades.get(existente.nome)!;
    }
  }
  const nome = `${pai}.${campo}`;
  let entidade = entidades.get(nome);
  if (!entidade) {
    entidade = { nome, origens: [], tipo: tipo && local ? tipo : null, local: tipo && local ? local : null, registros: [] };
    entidades.set(nome, entidade);
  }
  return entidade;
}

// ---------- Utilitários ----------

function semNulos(tipo: Type): Type {
  if (!tipo.isUnion()) return tipo;
  const resto = tipo.getUnionTypes().filter((t) => !t.isNull() && !t.isUndefined());
  return resto.length === 1 ? resto[0] : tipo;
}

/** Tira nulo, Observable, Promise e lista, até chegar no tipo do dado. */
function desembrulhar(tipo: Type): Type {
  const t = semNulos(tipo);
  const nome = t.getAliasSymbol()?.getName() ?? t.getSymbol()?.getName();
  const argumento = t.getTypeArguments()[0] ?? t.getAliasTypeArguments()[0];
  if ((nome === 'Observable' || nome === 'Promise' || nome === 'ReadonlyArray') && argumento) {
    return desembrulhar(argumento);
  }
  if (t.isArray()) {
    return desembrulhar(t.getArrayElementTypeOrThrow());
  }
  return t;
}

function herdaDeErro(tipo: Type): boolean {
  return tipo.getBaseTypes().some((base) => base.getSymbol()?.getName() === 'Error' || herdaDeErro(base));
}

function ehObjetoSimples(valor: unknown): valor is Registro {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor) && !(valor instanceof Date);
}

function listaDeObjetos(valor: unknown): Registro[] | null {
  return Array.isArray(valor) && valor.length > 0 && valor.every(ehObjetoSimples) ? (valor as Registro[]) : null;
}

function objetoDeListas(valor: unknown): Record<string, Registro[]> | null {
  if (!ehObjetoSimples(valor)) return null;
  const listas = Object.values(valor);
  return listas.length > 0 && listas.every((lista) => Array.isArray(lista) && lista.every(ehObjetoSimples)) && listas.some((l) => (l as unknown[]).length)
    ? (valor as Record<string, Registro[]>)
    : null;
}

function tipoObservado(valor: unknown): TipoObservado | null {
  if (valor instanceof Date) return 'data';
  if (typeof valor === 'string') return /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(valor) ? 'data' : 'texto';
  if (typeof valor === 'number') return 'numero';
  if (typeof valor === 'boolean') return 'booleano';
  return null;
}

function resumirExemplo(valor: unknown): string {
  const texto = Array.isArray(valor) ? `[${valor.join(', ')}]` : valor instanceof Date ? valor.toISOString() : String(valor);
  return texto.length > TAMANHO_DO_EXEMPLO ? `${texto.slice(0, TAMANHO_DO_EXEMPLO - 1)}…` : texto;
}

function semRepetidos(registros: Registro[]): Registro[] {
  const vistos = new Set<string>();
  return registros.filter((registro) => {
    const chave = JSON.stringify(registro);
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

function valoresUnicos(registros: Registro[], atributo: string): boolean {
  const valores = registros.map((r) => r[atributo]);
  return valores.length > 0 && valores.every((v) => v !== null && v !== undefined) && new Set(valores).size === valores.length;
}

/** `<x>Id`, `<x>_id`, `id<X>` → referência; `<x>Ids`, `<x>_ids` → lista de referências. */
function destinoPeloNome(atributo: string, entidades: Map<string, string>): { destino: string; lista: boolean } | null {
  const regras: [RegExp, boolean][] = [
    [/^(.+)Ids$/, true],
    [/^(.+)_ids$/i, true],
    [/^(.+)Id$/, false],
    [/^(.+)_id$/i, false],
    [/^id([A-Z].*)$/, false],
  ];
  for (const [regra, lista] of regras) {
    const alvo = regra.exec(atributo)?.[1];
    const destino = alvo && entidades.get(alvo.toLowerCase());
    if (destino) return { destino, lista };
  }
  return null;
}

function nomePeloExport(nome: string): string {
  const semSufixo = nome.replace(/(_MOCKS|_MOCK|Mocks|Mock)$/, '');
  return semSufixo
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((parte) => parte[0].toUpperCase() + parte.slice(1))
    .join('') || nome;
}

/** Converte o padrão `mocks` da configuração (ex.: `src/app/telas/**\/*.mock.ts`) num teste pelo nome do arquivo. */
function criarTesteDeMock(padrao: string): (arquivo: string) => boolean {
  const nome = basename(padrao).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  const regra = new RegExp(`^${nome}$`);
  return (arquivo) => regra.test(basename(arquivo));
}
