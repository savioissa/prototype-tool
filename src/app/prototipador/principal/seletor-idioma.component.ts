import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

import { ExibirTagsService } from './exibir-tags.service';
import { IdiomaService } from './idioma.service';
import { IDIOMAS, IDIOMA_TAGS, ehIdioma } from './idiomas';

/** Seletor do topo: PT, EN, ES ou Tag (cada texto traduzido aparece como a própria chave). */
@Component({
  selector: 'proto-seletor-idioma',
  standalone: true,
  imports: [FormsModule, DropdownModule],
  template: `
    <p-dropdown
      styleClass="proto-seletor-idioma"
      [autoDisplayFirst]="false"
      [options]="opcoes"
      optionLabel="rotulo"
      optionValue="codigo"
      ariaLabel="Idioma"
      [ngModel]="selecionado()"
      (ngModelChange)="selecionar($event)"
    />
  `,
  styles: `
    :host ::ng-deep .proto-seletor-idioma {
      width: 6.5rem;
      background: #fafafa;
    }

    :host ::ng-deep .proto-seletor-idioma .p-dropdown-label {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }
  `,
})
export class SeletorIdiomaComponent {
  private readonly idioma = inject(IdiomaService);
  private readonly exibirTags = inject(ExibirTagsService);

  protected readonly opcoes = [...IDIOMAS, { codigo: IDIOMA_TAGS, rotulo: 'Tag' }];
  protected readonly selecionado = computed(() =>
    this.exibirTags.ligado() ? IDIOMA_TAGS : this.idioma.idioma(),
  );

  protected selecionar(valor: string): void {
    if (ehIdioma(valor)) {
      this.idioma.escolher(valor);
    }
    this.exibirTags.definir(valor === IDIOMA_TAGS);
  }
}
