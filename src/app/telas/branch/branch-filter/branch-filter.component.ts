import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';

import { BranchFilter, FilterOperator } from '../branch.model';
import { opcoesTraduzidas } from '../traducao';

/** Painel de filtro da lista de filiais: Código e Descrição, cada um com operador + valor. */
@Component({
  selector: 'app-branch-filter',
  standalone: true,
  imports: [FormsModule, DropdownModule, InputTextModule, TranslateModule],
  templateUrl: './branch-filter.component.html',
  styleUrl: './branch-filter.component.scss'
})
export class BranchFilterComponent {
  @Input({ required: true }) filter!: BranchFilter;
  @Output() filterChange = new EventEmitter<BranchFilter>();

  /** Rótulos são tags; a lista acompanha a troca de idioma. */
  readonly operadores = opcoesTraduzidas<{ label: string; value: FilterOperator }>([
    { label: 'iclass.generic.label.equals', value: 'igual' },
    { label: 'iclass.generic.label.different', value: 'diferente' },
    { label: 'iclass.generic.label.contains', value: 'contem' },
    { label: 'iclass.generic.label.starts-with', value: 'comeca' },
    { label: 'iclass.generic.label.ends-with', value: 'termina' }
  ]);

  update<K extends keyof BranchFilter>(campo: K, patch: Partial<BranchFilter[K]>): void {
    this.filter = { ...this.filter, [campo]: { ...this.filter[campo], ...patch } };
    this.filterChange.emit(this.filter);
  }
}
