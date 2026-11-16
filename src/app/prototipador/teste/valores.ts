// Funções puras sobre os valores dos inputs: valor inicial por tipo, guarda no sessionStorage e resumo.
import type { TipoCampo } from '../modelo/tipos';

/** Valor de um campo novo (item de lista, objeto preenchido, nulo trocado por valor). */
export function valorInicial(tipo: TipoCampo): unknown {
  switch (tipo.tipo) {
    case 'texto':
      return '';
    case 'numero':
      return 0;
    case 'booleano':
      return false;
    case 'data':
      return new Date();
    case 'opcoes':
      return tipo.valores[0];
    case 'lista':
      return [];
    case 'objeto':
      return Object.fromEntries(
        tipo.campos.filter((campo) => !campo.opcional).map((campo) => [campo.nome, campo.aceitaNulo ? null : valorInicial(campo.tipo)]),
      );
    case 'naoEditavel':
      return undefined;
  }
}

// ---------- Guarda das edições ----------
// JSON perde `undefined` e `Date`; os dois são marcados para voltar como eram.

const MARCA = '@proto';
const INDEFINIDO = Symbol('indefinido');

export function serializar(valores: Record<string, unknown>): string {
  return JSON.stringify(valores, function (this: Record<string, unknown>, chave, valor) {
    const bruto = this[chave];
    if (bruto instanceof Date) {
      return { [MARCA]: 'data', valor: bruto.toISOString() };
    }
    if (valor === undefined && chave !== '') {
      return { [MARCA]: 'indefinido' };
    }
    return valor;
  });
}

export function desserializar(texto: string): Record<string, unknown> {
  const lido = JSON.parse(texto, (_, valor) => {
    if (valor && typeof valor === 'object' && MARCA in valor) {
      return valor[MARCA] === 'data' ? new Date(valor.valor) : INDEFINIDO;
    }
    return valor;
  });
  return restaurarIndefinidos(lido) as Record<string, unknown>;
}

/** No primeiro nível o indefinido é um valor (aplicado ao input); dentro de objetos, chave ausente. */
function restaurarIndefinidos(valor: unknown, nivel = 0): unknown {
  if (Array.isArray(valor)) {
    return valor.map((item) => (item === INDEFINIDO ? undefined : restaurarIndefinidos(item, nivel + 1)));
  }
  if (valor && typeof valor === 'object' && !(valor instanceof Date)) {
    const objeto: Record<string, unknown> = {};
    for (const [chave, item] of Object.entries(valor)) {
      if (item === INDEFINIDO) {
        if (nivel === 0) {
          objeto[chave] = undefined;
        }
      } else {
        objeto[chave] = restaurarIndefinidos(item, nivel + 1);
      }
    }
    return objeto;
  }
  return valor;
}

// ---------- Resumo dos eventos ----------

const TAMANHO_DO_RESUMO = 200;

/** JSON resumido, até 200 caracteres, que aguenta eventos do DOM e referências circulares. */
export function resumir(valor: unknown): string {
  if (valor === undefined) {
    return 'undefined';
  }
  const vistos = new WeakSet<object>();
  let texto: string;
  try {
    texto = JSON.stringify(valor, (_, item) => {
      if (typeof Event !== 'undefined' && item instanceof Event) {
        return `[${item.constructor.name} ${item.type}]`;
      }
      if (typeof Node !== 'undefined' && item instanceof Node) {
        return `[${item.nodeName.toLowerCase()}]`;
      }
      if (typeof item === 'function') {
        return '[função]';
      }
      if (item && typeof item === 'object') {
        if (vistos.has(item)) {
          return '[circular]';
        }
        vistos.add(item);
      }
      return item;
    }) ?? String(valor);
  } catch {
    texto = String(valor);
  }
  return texto.length > TAMANHO_DO_RESUMO ? `${texto.slice(0, TAMANHO_DO_RESUMO - 1)}…` : texto;
}
