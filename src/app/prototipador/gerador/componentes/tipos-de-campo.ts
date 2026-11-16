import { Node, Type, TypeFormatFlags, ts } from 'ts-morph';

import type { Campo, TipoCampo } from '../../modelo/tipos';

/** Objetos aninhados além deste nível viram `naoEditavel`. */
const PROFUNDIDADE_MAXIMA = 5;

/** Tipos que nunca são dado editável, com o motivo mostrado no aviso. */
const MOTIVOS_POR_NOME: Record<string, string> = {
  TemplateRef: 'TemplateRef',
  Observable: 'Observable',
  Subject: 'Observable',
  BehaviorSubject: 'Observable',
  ReplaySubject: 'Observable',
  EventEmitter: 'Observable',
  Promise: 'Promise',
  ElementRef: 'referência a elemento',
  Map: 'Map',
  Set: 'Set',
};

export interface CampoConvertido {
  tipo: TipoCampo;
  opcional: boolean;
  aceitaNulo: boolean;
}

interface Contexto {
  /** Nó de referência para escrever tipos e resolver propriedades. */
  local: Node;
  /** Caminho do campo, para os avisos (ex.: `branch.descricao`). */
  caminho: string;
  avisos: string[];
  /** Tipos objeto em aberto, do mais externo ao mais interno. */
  pilha: ts.Type[];
}

/** Converte o tipo TypeScript de um input no tipo de campo editável da área de teste. */
export function converterTipo(tipo: Type, local: Node, caminho: string, avisos: string[]): CampoConvertido {
  return converter(tipo, { local, caminho, avisos, pilha: [] });
}

function converter(tipo: Type, contexto: Contexto): CampoConvertido {
  let opcional = false;
  let aceitaNulo = false;
  const membros = (tipo.isUnion() ? tipo.getUnionTypes() : [tipo]).filter((membro) => {
    if (membro.isNull()) {
      aceitaNulo = true;
      return false;
    }
    if (membro.isUndefined()) {
      opcional = true;
      return false;
    }
    return true;
  });
  return { tipo: converterMembros(tipo, membros, contexto), opcional, aceitaNulo };
}

function converterMembros(original: Type, membros: Type[], contexto: Contexto): TipoCampo {
  if (membros.length === 0) {
    return naoEditavel(original, 'só aceita nulo ou indefinido', contexto);
  }
  if (membros.length > 1) {
    // `boolean` chega aqui como a união `true | false`.
    if (membros.every((membro) => membro.isBooleanLiteral())) {
      return { tipo: 'booleano' };
    }
    const valores = membros.map(valorLiteral);
    if (valores.every((valor): valor is string | number => valor !== undefined)) {
      return { tipo: 'opcoes', valores };
    }
    return naoEditavel(original, 'união de tipos diferentes', contexto);
  }
  return converterUnico(membros[0], contexto);
}

function converterUnico(tipo: Type, contexto: Contexto): TipoCampo {
  if (tipo.isAny()) {
    return naoEditavel(tipo, 'any', contexto);
  }
  if (tipo.isUnknown()) {
    return naoEditavel(tipo, 'unknown', contexto);
  }
  if (tipo.isTypeParameter()) {
    return naoEditavel(tipo, 'parâmetro genérico', contexto);
  }
  if (tipo.isString()) {
    return { tipo: 'texto' };
  }
  if (tipo.isNumber()) {
    return { tipo: 'numero' };
  }
  if (tipo.isBoolean() || tipo.isBooleanLiteral()) {
    return { tipo: 'booleano' };
  }
  const literal = valorLiteral(tipo);
  if (literal !== undefined) {
    return { tipo: 'opcoes', valores: [literal] };
  }

  // Apelidos como `Signal<T>` só têm nome no símbolo do apelido; os outros, no símbolo do tipo.
  const nomes = [tipo.getAliasSymbol()?.getName(), tipo.getSymbol()?.getName()].filter((n): n is string => !!n);
  if (nomes.includes('Date')) {
    return { tipo: 'data' };
  }
  const motivo = nomes.map((n) => MOTIVOS_POR_NOME[n]).find(Boolean);
  if (motivo) {
    return naoEditavel(tipo, motivo, contexto);
  }
  if (tipo.getCallSignatures().length > 0) {
    return naoEditavel(tipo, nomes.some((n) => /Signal/.test(n)) ? 'signal' : 'função', contexto);
  }
  if (tipo.isTuple()) {
    return naoEditavel(tipo, 'tupla', contexto);
  }
  if (tipo.isArray() || nomes.includes('ReadonlyArray')) {
    const item = tipo.isArray() ? tipo.getArrayElementTypeOrThrow() : tipo.getTypeArguments()[0];
    if (!item) {
      return naoEditavel(tipo, 'lista sem tipo de item', contexto);
    }
    // A nulidade do item não tem onde ser registrada em `lista`; vale só o tipo.
    return { tipo: 'lista', item: converter(item, { ...contexto, caminho: `${contexto.caminho}[]` }).tipo };
  }
  if (tipo.isObject() || tipo.isIntersection()) {
    return converterObjeto(tipo, contexto);
  }
  return naoEditavel(tipo, 'tipo não suportado', contexto);
}

function converterObjeto(tipo: Type, contexto: Contexto): TipoCampo {
  if (contexto.pilha.includes(tipo.compilerType)) {
    return naoEditavel(tipo, 'tipo que se refere a si mesmo', contexto);
  }
  if (contexto.pilha.length >= PROFUNDIDADE_MAXIMA) {
    return naoEditavel(tipo, `aninhamento além de ${PROFUNDIDADE_MAXIMA} níveis`, contexto);
  }
  const propriedades = tipo.getProperties();
  if (propriedades.length === 0 && (tipo.getStringIndexType() || tipo.getNumberIndexType())) {
    return naoEditavel(tipo, 'dicionário com chaves livres', contexto);
  }

  const temMetodos = propriedades.some((propriedade) =>
    propriedade
      .getDeclarations()
      .some((declaracao) => Node.isMethodDeclaration(declaracao) || Node.isMethodSignature(declaracao)),
  );
  if (temMetodos) {
    return naoEditavel(tipo, 'objeto com métodos', contexto);
  }

  const pilha = [...contexto.pilha, tipo.compilerType];
  const campos: Campo[] = propriedades.map((propriedade) => {
    const nome = propriedade.getName();
    const convertido = converter(propriedade.getTypeAtLocation(contexto.local), {
      ...contexto,
      caminho: `${contexto.caminho}.${nome}`,
      pilha,
    });
    return {
      nome,
      tipo: convertido.tipo,
      opcional: convertido.opcional || propriedade.hasFlags(ts.SymbolFlags.Optional),
      aceitaNulo: convertido.aceitaNulo,
    };
  });
  return { tipo: 'objeto', campos };
}

function valorLiteral(tipo: Type): string | number | undefined {
  if (tipo.isStringLiteral() || tipo.isNumberLiteral() || tipo.isEnumLiteral()) {
    const valor = tipo.getLiteralValue();
    return typeof valor === 'string' || typeof valor === 'number' ? valor : undefined;
  }
  return undefined;
}

function naoEditavel(tipo: Type, motivo: string, contexto: Contexto): TipoCampo {
  const textoDoTipo = tipo.getText(
    contexto.local,
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | TypeFormatFlags.NoTruncation,
  );
  contexto.avisos.push(`Input "${contexto.caminho}" não é editável: ${motivo} (tipo ${textoDoTipo}).`);
  return { tipo: 'naoEditavel', textoDoTipo, motivo };
}
