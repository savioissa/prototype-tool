import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TranslateModule } from '@ngx-translate/core';

import { BranchFilterComponent } from '../branch-filter/branch-filter.component';
import { BranchFilter, SortState, Warehouse, emptyFilter } from '../branch.model';
import { BranchService } from '../branch.service';
import { filterAndSort, hasActiveFilter } from '../filter-sort';
import { BranchStockPartitionCardComponent } from '../branch-stock-partition-card/branch-stock-partition-card.component';

type LoadStatus = 'loading' | 'ready' | 'error';

/**
 * Escolha de um almoxarifado ao adicionar repositório. Sem escolha, é uma área clicável que abre, no lugar
 * dela, a vinculação: todos os almoxarifados do sistema, cada card com "Selecionar" ("Fechar", no rodapé, volta à área).
 * Começa com a vinculação aberta. Com um escolhido, fica só o card dele; acima, "Alterar" reabre a vinculação
 * (a escolha vale até outra ser feita) e "Remover" desfaz a escolha e volta à área.
 */
@Component({
  selector: 'app-branch-stock-partition-picker',
  standalone: true,
  imports: [ButtonModule, PaginatorModule, BranchFilterComponent, BranchStockPartitionCardComponent, TranslateModule],
  templateUrl: './branch-stock-partition-picker.component.html',
  styleUrl: './branch-stock-partition-picker.component.scss'
})
export class BranchStockPartitionPickerComponent implements OnInit {
  private readonly service = inject(BranchService);

  @Input() selected: Warehouse | null = null;
  @Output() selectedChange = new EventEmitter<Warehouse | null>();

  readonly rows = 3;
  readonly skeletons = Array.from({ length: 3 });

  status: LoadStatus = 'loading';
  /** Vinculação (lista) visível no lugar da área clicável ou do card escolhido. Vem aberta por padrão. */
  aberto = true;
  catalogo: Warehouse[] = [];
  resultado: Warehouse[] = [];
  first = 0;

  showFilter = false;
  /** Filtro em edição no painel. */
  filtro: BranchFilter = emptyFilter();
  /** Filtro em vigor: o do painel só passa a valer quando o usuário clica em Atualizar. */
  filtroAplicado: BranchFilter = emptyFilter();
  readonly ordenacao: SortState = { campo: 'descricao', direcao: 'asc' };

  get pagina(): Warehouse[] {
    return this.resultado.slice(this.first, this.first + this.rows);
  }

  get filtroAtivo(): boolean {
    return hasActiveFilter(this.filtroAplicado);
  }

  ngOnInit(): void {
    // já com escolha (ex.: voltando à tela), mostra o card em vez da vinculação
    if (this.selected) this.aberto = false;
    this.carregar();
  }

  abrirVinculacao(): void {
    this.aberto = true;
  }

  /** Fecha a vinculação sem mudar a escolha: volta ao card ou à área clicável. */
  fechar(): void {
    this.aberto = false;
  }

  carregar(): void {
    this.status = 'loading';
    this.filtroAplicado = this.filtro;
    this.service.listarCatalogoAlmoxarifados().subscribe({
      next: (lista) => {
        this.catalogo = lista;
        this.status = 'ready';
        this.resultado = filterAndSort(this.catalogo, this.filtroAplicado, this.ordenacao);
        this.first = 0;
      },
      error: () => (this.status = 'error')
    });
  }

  escolher(stockPartition: Warehouse | null): void {
    this.aberto = false;
    this.selectedChange.emit(stockPartition);
  }

  onFilterChange(filtro: BranchFilter): void {
    this.filtro = filtro;
  }

  onPage(event: PaginatorState): void {
    this.first = event.first ?? 0;
  }

  abrir(stockPartition: Warehouse): void {
    // TODO: navegar para a home do almoxarifado (a página ainda não existe)
    void stockPartition;
  }
}
