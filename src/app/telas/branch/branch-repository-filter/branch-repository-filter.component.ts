import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslateModule } from '@ngx-translate/core';

import {
  FilterField,
  FilterOperator,
  REPOSITORY_FIELDS,
  REPOSITORY_FILTER_ORDER,
  REPOSITORY_TYPES,
  RepositoryField,
  RepositoryFieldDef,
  RepositoryFilter,
  RepositoryType
} from '../branch.model';
import { repositoryTypeAllowed } from '../filter-sort';
import { opcoesTraduzidas } from '../traducao';

/**
 * Painel de filtro de repositórios: Tipo repositório (seleção múltipla) e, para cada tipo, os dois campos dele com
 * operador + valor (Código/Descrição do armazém, Código/Descrição da credenciada, Login/Nome da equipe,
 * Descrição/Credenciada da oficina, Regional/Nome do cluster). Com Tipo repositório marcado, os campos dos tipos
 * não marcados ficam desabilitados.
 * Com `tipo` (escolha de repositório ao adicionar) o painel mostra só os dois campos desse tipo, sem Tipo repositório.
 */
@Component({
  selector: 'app-branch-repository-filter',
  standalone: true,
  imports: [FormsModule, DropdownModule, InputTextModule, MultiSelectModule, TranslateModule],
  templateUrl: './branch-repository-filter.component.html',
  styleUrl: './branch-repository-filter.component.scss'
})
export class BranchRepositoryFilterComponent {
  @Input({ required: true }) filter!: RepositoryFilter;
  /** Prefixo dos ids dos campos: a aba e a seção de adicionar podem estar abertas ao mesmo tempo. */
  @Input() idPrefix = 'repository-filter';
  /** Tipo fixo: mostra só os campos dele. */
  @Input() tipo: RepositoryType | null = null;
  @Output() filterChange = new EventEmitter<RepositoryFilter>();

  readonly tipos = opcoesTraduzidas(REPOSITORY_TYPES, (tipo) => tipo.tag);

  /** Rótulos são tags; a lista acompanha a troca de idioma. */
  readonly operadores = opcoesTraduzidas<{ label: string; value: FilterOperator }>([
    { label: 'iclass.generic.label.equals', value: 'igual' },
    { label: 'iclass.generic.label.different', value: 'diferente' },
    { label: 'iclass.generic.label.contains', value: 'contem' },
    { label: 'iclass.generic.label.starts-with', value: 'comeca' },
    { label: 'iclass.generic.label.ends-with', value: 'termina' }
  ]);

  get grupos(): { tipo: RepositoryType; campos: RepositoryFieldDef[] }[] {
    const tipos = this.tipo ? [this.tipo] : REPOSITORY_FILTER_ORDER;
    return tipos.map((tipo) => ({ tipo, campos: REPOSITORY_FIELDS[tipo] }));
  }

  habilitado(tipo: RepositoryType): boolean {
    return repositoryTypeAllowed(this.filter, tipo);
  }

  setTipos(tipos: RepositoryType[] | null): void {
    this.emit({ ...this.filter, tipos: tipos ?? [] });
  }

  update(tipo: RepositoryType, campo: RepositoryField, patch: Partial<FilterField>): void {
    const grupo = this.filter.campos[tipo];
    this.emit({
      ...this.filter,
      campos: { ...this.filter.campos, [tipo]: { ...grupo, [campo]: { ...grupo[campo], ...patch } } }
    });
  }

  private emit(filter: RepositoryFilter): void {
    this.filter = filter;
    this.filterChange.emit(filter);
  }
}
