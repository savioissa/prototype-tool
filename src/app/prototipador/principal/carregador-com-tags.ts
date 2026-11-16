import { TranslateLoader } from '@ngx-translate/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { IDIOMAS, IDIOMA_TAGS } from './idiomas';

type Traducoes = Record<string, unknown>;

function ehObjeto(valor: unknown): valor is Traducoes {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/** Une as chaves dos arquivos de todos os idiomas, mantendo a estrutura. */
function unir(destino: Traducoes, origem: Traducoes): Traducoes {
  for (const [chave, valor] of Object.entries(origem)) {
    const atual = destino[chave];
    if (ehObjeto(atual) && ehObjeto(valor)) {
      unir(atual, valor);
    } else if (!ehObjeto(atual)) {
      destino[chave] = ehObjeto(valor) ? unir({}, valor) : valor;
    }
  }
  return destino;
}

/** Troca cada valor pelo caminho completo da chave. Serve para chaves aninhadas e planas. */
function trocarPelasChaves(traducoes: Traducoes, prefixo = ''): Traducoes {
  const resultado: Traducoes = {};
  for (const [chave, valor] of Object.entries(traducoes)) {
    const caminho = prefixo ? `${prefixo}.${chave}` : chave;
    resultado[chave] = ehObjeto(valor) ? trocarPelasChaves(valor, caminho) : caminho;
  }
  return resultado;
}

/**
 * Envolve o carregador de traduções do projeto. Idiomas reais vão direto ao original;
 * o pseudo-idioma `proto-tags` devolve as chaves no lugar dos textos.
 */
export class CarregadorComTags implements TranslateLoader {
  constructor(private readonly original: TranslateLoader) {}

  getTranslation(idioma: string): Observable<unknown> {
    if (idioma !== IDIOMA_TAGS) {
      return this.original.getTranslation(idioma);
    }
    const arquivos = IDIOMAS.map(({ codigo }) =>
      this.original.getTranslation(codigo).pipe(catchError(() => of({}))),
    );
    return forkJoin(arquivos).pipe(
      map((lista) => trocarPelasChaves(lista.reduce<Traducoes>((uniao, t) => unir(uniao, t), {}))),
    );
  }
}

export function comExibirTags(original: TranslateLoader): TranslateLoader {
  return new CarregadorComTags(original);
}
