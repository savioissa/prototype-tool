import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TranslateModule } from '@ngx-translate/core';

import {
  REPOSITORY_TYPES,
  Repository,
  RepositoryFilter,
  RepositorySortState,
  RepositoryType,
  emptyRepositoryFilter,
  repositoryKey
} from '../branch.model';
import { BranchService } from '../branch.service';
import { filterAndSortRepositories, hasActiveRepositoryFilter } from '../filter-sort';
import { BranchRepositoryCardComponent } from '../branch-repository-card/branch-repository-card.component';
import { BranchRepositoryFilterComponent } from '../branch-repository-filter/branch-repository-filter.component';
import { opcoesTraduzidas } from '../traducao';

type LoadStatus = 'loading' | 'ready' | 'error';

/**
 * Escolha de um repositório ao adicionar. Sem escolha, é uma área clicável que abre, no lugar dela, a
 * vinculação: o select de tipo (Equipe por padrão, na linha do rótulo enquanto a vinculação está aberta) define
 * quais repositórios do sistema aparecem, cada card com "Selecionar" ("Fechar", no rodapé, volta à área).
 * Com um escolhido, fica só o card dele; acima, "Alterar" reabre a
 * vinculação (a escolha vale até outra ser feita) e "Remover" desfaz a escolha e volta à área.
 * Começa fechada; a lista carrega na primeira vez que abre.
 */
@Component({
  selector: 'app-branch-repository-picker',
  standalone: true,
  imports: [FormsModule, ButtonModule, DropdownModule, PaginatorModule, BranchRepositoryCardComponent, BranchRepositoryFilterComponent, TranslateModule],
  templateUrl: './branch-repository-picker.component.html',
  styleUrl: '../branch-stock-partition-picker/branch-stock-partition-picker.component.scss'
})
export class BranchRepositoryPickerComponent {
  private readonly service = inject(BranchService);

  @Input() selected: Repository | null = null;
  @Output() selectedChange = new EventEmitter<Repository | null>();

  readonly tipos = opcoesTraduzidas(REPOSITORY_TYPES, (tipo) => tipo.tag);
  readonly rows = 3;
  readonly skeletons = Array.from({ length: 3 });
  readonly key = repositoryKey;

  tipo: RepositoryType = 'equipe';
  status: LoadStatus = 'loading';
  /** Vinculação (lista) visível no lugar da área clicável ou do card escolhido. */
  aberto = false;
  private carregado = false;
  repositorios: Repository[] = [];
  resultado: Repository[] = [];
  first = 0;

  showFilter = false;
  /** Filtro em edição no painel (só os campos do tipo escolhido). */
  filtro: RepositoryFilter = emptyRepositoryFilter();
  /** Filtro em vigor: o do painel só passa a valer quando o usuário clica em Atualizar. */
  filtroAplicado: RepositoryFilter = emptyRepositoryFilter();
  /** Ordem fixa: Nome / Técnico do tipo escolhido, crescente. */
  get ordenacao(): RepositorySortState {
    return { campo: `${this.tipo}.nome`, direcao: 'asc' };
  }

  get pagina(): Repository[] {
    return this.resultado.slice(this.first, this.first + this.rows);
  }

  get filtroAtivo(): boolean {
    return hasActiveRepositoryFilter(this.filtroAplicado);
  }

  abrirVinculacao(): void {
    this.aberto = true;
    if (!this.carregado) {
      this.carregado = true;
      this.carregar();
    }
  }

  /** Fecha a vinculação sem mudar a escolha: volta ao card ou à área clicável. */
  fechar(): void {
    this.aberto = false;
  }

  escolher(repository: Repository | null): void {
    this.aberto = false;
    this.selectedChange.emit(repository);
  }

  /** Trocar o tipo limpa o filtro (os campos são de outro tipo) e carrega os repositórios do tipo novo. */
  onTipoChange(tipo: RepositoryType): void {
    this.tipo = tipo;
    this.filtro = emptyRepositoryFilter();
    this.carregar();
  }

  carregar(): void {
    this.status = 'loading';
    this.filtroAplicado = this.filtro;
    const tipo = this.tipo;
    this.service.listarRepositoriosPorTipo(tipo).subscribe({
      next: (lista) => {
        if (tipo !== this.tipo) return; // resposta de um tipo que já foi trocado
        this.repositorios = lista;
        this.status = 'ready';
        this.resultado = filterAndSortRepositories(this.repositorios, this.filtroAplicado, this.ordenacao);
        this.first = 0;
      },
      error: () => (this.status = 'error')
    });
  }

  onFilterChange(filtro: RepositoryFilter): void {
    this.filtro = filtro;
  }

  onPage(event: PaginatorState): void {
    this.first = event.first ?? 0;
  }

  abrir(repository: Repository): void {
    // TODO: navegar para a home do repositório (a página ainda não existe)
    void repository;
  }
}
