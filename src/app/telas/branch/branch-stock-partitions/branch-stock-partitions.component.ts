import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BranchFilterComponent } from '../branch-filter/branch-filter.component';
import { BranchSortComponent } from '../branch-sort/branch-sort.component';
import { BranchFilter, SortState, Warehouse, emptyFilter } from '../branch.model';
import { BranchService, RepositoryLinkedError } from '../branch.service';
import { filterAndSort, hasActiveFilter } from '../filter-sort';
import { BranchStockPartitionCardComponent } from '../branch-stock-partition-card/branch-stock-partition-card.component';
import { BranchStockPartitionLinkComponent } from '../branch-stock-partition-link/branch-stock-partition-link.component';

type LoadStatus = 'loading' | 'ready' | 'error';

/** Aba Almoxarifado do detalhe da filial: almoxarifados vinculados, com filtro, ordenação e paginação. */
@Component({
  selector: 'app-branch-stock-partitions',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    PaginatorModule,
    BranchFilterComponent,
    BranchSortComponent,
    BranchStockPartitionCardComponent,
    BranchStockPartitionLinkComponent, TranslateModule
  ],
  // confirmação só desta aba (o <p-confirmDialog> fica no template)
  providers: [ConfirmationService],
  templateUrl: './branch-stock-partitions.component.html',
  styleUrl: './branch-stock-partitions.component.scss'
})
export class BranchStockPartitionsComponent implements OnChanges {
  private readonly service = inject(BranchService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly confirmation = inject(ConfirmationService);

  constructor() {
    // vínculos mexidos na aba Repositório (ex.: almoxarifado vinculado à filial junto com o repositório)
    this.service.linkChanges$.pipe(takeUntilDestroyed()).subscribe((c) => {
      if (c.origem === 'repositorio' && c.filial === this.branchCode && this.status !== 'loading') this.carregar();
    });
  }

  /** `null` enquanto a filial ainda carrega: a aba mostra o próprio skeleton e busca assim que o código chegar. */
  @Input({ required: true }) branchCode!: string | null;

  readonly rows = 7;
  readonly skeletons = Array.from({ length: 3 });

  status: LoadStatus = 'loading';
  stockPartitions: Warehouse[] = [];
  resultado: Warehouse[] = [];
  first = 0;

  showFilter = false;
  showSort = false;
  showLink = false;
  /** Consultando vínculos com repositórios antes de desvincular (evita clique duplo). */
  verificando = false;

  /** Filtro em edição no painel. */
  filtro: BranchFilter = emptyFilter();
  /** Filtro em vigor: o do painel só passa a valer quando o usuário clica em Atualizar. */
  filtroAplicado: BranchFilter = emptyFilter();
  /** Ordenação padrão da lista de almoxarifados: Descrição, crescente (especificação da home). */
  ordenacao: SortState = { campo: 'descricao', direcao: 'asc' };

  get pagina(): Warehouse[] {
    return this.resultado.slice(this.first, this.first + this.rows);
  }

  get filtroAtivo(): boolean {
    return hasActiveFilter(this.filtroAplicado);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Carrega quando o código chega pela primeira vez. Se o código mudar depois (edição do cadastro),
    // os vínculos acompanham no serviço e não precisa recarregar.
    const change = changes['branchCode'];
    if (change && change.currentValue && !change.previousValue) {
      this.carregar();
    }
  }

  carregar(): void {
    this.status = 'loading';
    this.filtroAplicado = this.filtro;
    if (!this.branchCode) return;
    this.service.listarAlmoxarifados(this.branchCode).subscribe({
      next: (lista) => {
        this.stockPartitions = lista;
        this.status = 'ready';
        this.aplicar();
      },
      error: () => (this.status = 'error')
    });
  }

  onFilterChange(filtro: BranchFilter): void {
    this.filtro = filtro;
  }

  onSortChange(ordenacao: SortState): void {
    this.ordenacao = ordenacao;
    this.aplicar();
  }

  aplicar(): void {
    this.resultado = filterAndSort(this.stockPartitions, this.filtroAplicado, this.ordenacao);
    this.first = 0;
  }

  onPage(event: PaginatorState): void {
    this.first = event.first ?? 0;
  }

  /** Vínculo feito na seção de seleção: fecha a seção e recarrega os vinculados. */
  /** Abre ou fecha a seção de vincular; ao abrir, fecha filtro e ordenação (o filtro aplicado continua valendo). */
  alternarVincular(): void {
    this.showLink = !this.showLink;
    if (this.showLink) {
      this.showFilter = false;
      this.showSort = false;
    }
  }

  onLinked(): void {
    this.showLink = false;
    this.carregar();
  }

  /**
   * Desvincula o almoxarifado da filial. Se algum repositório da filial estiver vinculado a ele, avisa num
   * toast que não dá para desvincular; senão pede confirmação.
   */
  desvincular(stockPartition: Warehouse): void {
    if (!this.branchCode || this.verificando) return;
    const filial = this.branchCode;
    this.verificando = true;

    this.service.temRepositorioNoAlmoxarifado(filial, stockPartition.codigo).subscribe({
      next: (vinculado) => {
        this.verificando = false;
        if (vinculado) {
          this.avisarRepositorio();
          return;
        }
        this.confirmarDesvinculo(filial, stockPartition);
      },
      error: () => {
        this.verificando = false;
        this.erroDesvincular();
      }
    });
  }

  private confirmarDesvinculo(filial: string, stockPartition: Warehouse): void {
    this.confirmation.confirm({
      header: this.translate.instant('portal.model.tree.label.attention'),
      message: this.translate.instant('iclass.generic.label.confirm-unlink'),
      acceptLabel: this.translate.instant('portal.generic.button.unlink'),
      rejectLabel: this.translate.instant('portal.generic.button.cancel'),
      acceptButtonStyleClass: 'btn--md btn--danger',
      rejectButtonStyleClass: 'btn--md btn--neutral',
      acceptIcon: 'none',
      rejectIcon: 'none',
      defaultFocus: 'reject',
      accept: () =>
        this.service.desvincularAlmoxarifado(filial, stockPartition.codigo).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: this.translate.instant('iclass.generic.label.stock-partition-unlinked-successfully'), life: 4000 });
            this.carregar();
          },
          // repositório vinculado entre a verificação e a confirmação: o serviço recusa e o aviso aparece
          error: (err: unknown) => (err instanceof RepositoryLinkedError ? this.avisarRepositorio() : this.erroDesvincular())
        })
    });
  }

  /** Desvínculo bloqueado: algum repositório da filial está vinculado ao almoxarifado. */
  private avisarRepositorio(): void {
    this.messages.add({
      severity: 'warn',
      summary: this.translate.instant('iclass.generic.label.cannot-unlink-stock-partition-repository-linked'),
      life: 6000
    });
  }

  private erroDesvincular(): void {
    this.messages.add({
      severity: 'error',
      summary: this.translate.instant('iclass.generic.label.could-not-unlink-stock-partition'),
      life: 6000
    });
  }

  abrir(stockPartition: Warehouse): void {
    // TODO: navegar para a home do almoxarifado (a página ainda não existe)
    void stockPartition;
  }
}
