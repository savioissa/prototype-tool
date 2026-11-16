import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TranslateModule } from '@ngx-translate/core';

import { REPOSITORY_SORT_OPTIONS, RepositorySortField, RepositorySortState } from '../branch.model';
import { opcoesTraduzidas } from '../traducao';

/**
 * Painel de ordenação de repositórios, com as mesmas opções do filtro: Tipo repositório e os dois campos de cada
 * tipo (ex.: Código do armazém, Descrição da oficina). Usa o template do painel da filial.
 */
@Component({
  selector: 'app-branch-repository-sort',
  standalone: true,
  imports: [FormsModule, ButtonModule, DropdownModule, TranslateModule],
  templateUrl: '../branch-sort/branch-sort.component.html',
  styleUrl: '../branch-sort/branch-sort.component.scss'
})
export class BranchRepositorySortComponent {
  @Input({ required: true }) sort!: RepositorySortState;
  @Output() sortChange = new EventEmitter<RepositorySortState>();

  /** Rótulos são tags; a lista acompanha a troca de idioma. */
  readonly campos = opcoesTraduzidas(REPOSITORY_SORT_OPTIONS);

  setCampo(campo: RepositorySortField | null): void {
    this.emit({ ...this.sort, campo });
  }

  inverterDirecao(): void {
    this.emit({ ...this.sort, direcao: this.sort.direcao === 'asc' ? 'desc' : 'asc' });
  }

  private emit(sort: RepositorySortState): void {
    this.sort = sort;
    this.sortChange.emit(sort);
  }
}
