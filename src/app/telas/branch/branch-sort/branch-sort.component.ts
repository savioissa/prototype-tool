import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TranslateModule } from '@ngx-translate/core';

import { SortField, SortState } from '../branch.model';
import { opcoesTraduzidas } from '../traducao';

/** Painel de ordenação por Código ou Descrição, com direção crescente/decrescente. */
@Component({
  selector: 'app-branch-sort',
  standalone: true,
  imports: [FormsModule, ButtonModule, DropdownModule, TranslateModule],
  templateUrl: './branch-sort.component.html',
  styleUrl: './branch-sort.component.scss'
})
export class BranchSortComponent {
  @Input({ required: true }) sort!: SortState;
  @Output() sortChange = new EventEmitter<SortState>();

  /** Rótulos são tags; a lista acompanha a troca de idioma. */
  readonly campos = opcoesTraduzidas<{ label: string; value: SortField }>([
    { label: 'iclass.generic.label.code', value: 'codigo' },
    { label: 'iclass.generic.label.description', value: 'descricao' }
  ]);

  setCampo(campo: SortField | null): void {
    this.emit({ ...this.sort, campo });
  }

  inverterDirecao(): void {
    this.emit({ ...this.sort, direcao: this.sort.direcao === 'asc' ? 'desc' : 'asc' });
  }

  private emit(sort: SortState): void {
    this.sort = sort;
    this.sortChange.emit(sort);
  }
}
