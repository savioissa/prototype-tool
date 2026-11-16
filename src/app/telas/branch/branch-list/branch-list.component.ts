import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BranchCardComponent } from '../branch-card/branch-card.component';
import { BranchFilterComponent } from '../branch-filter/branch-filter.component';
import { BranchSortComponent } from '../branch-sort/branch-sort.component';
import { Branch, BranchFilter, SortState, emptyFilter, emptySort } from '../branch.model';
import { BranchService } from '../branch.service';
import { filterAndSort, hasActiveFilter } from '../filter-sort';

type LoadStatus = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [ButtonModule, PaginatorModule, BranchCardComponent, BranchFilterComponent, BranchSortComponent, TranslateModule],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.scss'
})
export class BranchListComponent implements OnInit {
  private readonly service = inject(BranchService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly rows = 7;
  readonly skeletons = Array.from({ length: this.rows });

  status: LoadStatus = 'loading';
  branches: Branch[] = [];
  resultado: Branch[] = [];
  first = 0;
  /** Código da filial sendo conferida pelo handle antes de abrir (o botão mostra carregando). */
  abrindo: string | null = null;

  showFilter = false;
  showSort = false;

  /** Filtro em edição no painel. */
  filtro: BranchFilter = emptyFilter();
  /** Filtro em vigor: o do painel só passa a valer quando o usuário clica em Atualizar. */
  filtroAplicado: BranchFilter = emptyFilter();
  ordenacao: SortState = emptySort();

  get pagina(): Branch[] {
    return this.resultado.slice(this.first, this.first + this.rows);
  }

  get filtroAtivo(): boolean {
    return hasActiveFilter(this.filtroAplicado);
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.status = 'loading';
    this.filtroAplicado = this.filtro;
    this.service.listar().subscribe({
      next: (lista) => {
        this.branches = lista;
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

  /** Recalcula a lista com filtro + ordenação e volta para a primeira página. */
  aplicar(): void {
    this.resultado = filterAndSort(this.branches, this.filtroAplicado, this.ordenacao);
    this.first = 0;
  }

  onPage(event: PaginatorState): void {
    this.first = event.first ?? 0;
  }

  novo(): void {
    this.router.navigate(['/filial/nova']);
  }

  /**
   * Handle do card: confere a filial antes de abrir. Não encontrada ou erro: o mesmo toast de erro e o usuário fica na
   * lista. Encontrada: abre a página já com a filial, que não precisa buscar de novo.
   */
  abrir(branch: Branch): void {
    if (this.abrindo) return;
    this.abrindo = branch.codigo;
    this.service.obter(branch.codigo).subscribe({
      next: (encontrada) => {
        this.abrindo = null;
        if (!encontrada) {
          this.erroAoAbrir();
          return;
        }
        this.router.navigate(['/filial', encontrada.codigo], { state: { branch: encontrada } });
      },
      error: () => {
        this.abrindo = null;
        this.erroAoAbrir();
      }
    });
  }

  private erroAoAbrir(): void {
    this.messages.add({ severity: 'error', summary: this.translate.instant('iclass.generic.label.could-not-load-branch'), life: 6000 });
  }
}
