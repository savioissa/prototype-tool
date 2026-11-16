import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { gravar, ler } from '../moldura/armazenamento';
import { IdiomaService } from './idioma.service';
import { IDIOMA_TAGS } from './idiomas';

const CHAVE = 'proto.exibirTags';

/**
 * Modo "exibir tags" (opção Tag do seletor): troca o idioma pelo pseudo-idioma `proto-tags`.
 * O idioma escolhido é mantido e volta a valer ao desligar. É o único ponto que chama `use`.
 */
@Injectable({ providedIn: 'root' })
export class ExibirTagsService {
  private readonly traducao = inject(TranslateService);
  private readonly idioma = inject(IdiomaService);

  readonly ligado = signal<boolean>(ler<unknown>(CHAVE, false) === true);

  constructor() {
    this.traducao.addLangs([IDIOMA_TAGS]);
    this.aplicar();
  }

  definir(ligado: boolean): void {
    this.ligado.set(ligado);
    gravar(CHAVE, ligado);
    this.aplicar();
  }

  private aplicar(): void {
    this.traducao.use(this.ligado() ? IDIOMA_TAGS : this.idioma.idioma());
  }
}
