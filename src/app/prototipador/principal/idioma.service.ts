import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { gravar, ler } from '../moldura/armazenamento';
import { CodigoIdioma, IDIOMAS, ehIdioma } from './idiomas';

const CHAVE = 'proto.idioma';

/**
 * Idioma escolhido no seletor do topo. Vale para a aplicação inteira.
 * Quem aplica a troca no serviço de tradução é o ExibirTagsService.
 */
@Injectable({ providedIn: 'root' })
export class IdiomaService {
  private readonly traducao = inject(TranslateService);

  readonly idioma = signal<CodigoIdioma>(this.idiomaInicial());

  escolher(codigo: CodigoIdioma): void {
    this.idioma.set(codigo);
    gravar(CHAVE, codigo);
  }

  private idiomaInicial(): CodigoIdioma {
    const guardado = ler<unknown>(CHAVE, null);
    if (ehIdioma(guardado)) {
      return guardado;
    }
    const doProjeto = this.traducao.currentLang || this.traducao.defaultLang;
    return ehIdioma(doProjeto) ? doProjeto : IDIOMAS[0].codigo;
  }
}
