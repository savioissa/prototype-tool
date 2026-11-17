import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TabView, TabViewModule } from 'primeng/tabview';
import { filter, map, of, switchMap, tap } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BranchRegisterComponent } from '../branch-register/branch-register.component';
import { BranchRepositoriesComponent } from '../branch-repositories/branch-repositories.component';
import { BranchSidebarComponent } from '../branch-sidebar/branch-sidebar.component';
import { BranchStockPartitionsComponent } from '../branch-stock-partitions/branch-stock-partitions.component';
import { Branch } from '../branch.model';
import { BranchService } from '../branch.service';

type LoadStatus = 'loading' | 'ready';

/**
 * Página de uma filial: breadcrumb no topo (Lista > Página da Filial), resumo à esquerda e abas à direita.
 * A lista confere a filial antes de abrir e manda junto (estado da navegação); aberta direto pela URL, a página
 * busca a filial e, se ela não existir ou o serviço falhar, volta para a lista com um toast de erro.
 * Aba Cadastro: app-branch-register (leitura e edição do cadastro); ao gravar, a lateral e a URL acompanham.
 * Aba Almoxarifado: almoxarifados vinculados (carregada só quando a aba é aberta).
 * Aba Repositório: repositórios vinculados, com os almoxarifados da filial associados (também lazy).
 * Com o Cadastro em edição, trocar de aba ou sair da página (rota com o guard `podeSair`) pede confirmação.
 */
@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [
    BreadcrumbModule,
    TabViewModule,
    BranchRegisterComponent,
    BranchSidebarComponent,
    BranchStockPartitionsComponent,
    BranchRepositoriesComponent, TranslateModule
  ],
  templateUrl: './branch-detail.component.html',
  styleUrl: './branch-detail.component.scss'
})
export class BranchDetailComponent implements OnInit {
  private readonly service = inject(BranchService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  /** Filial que a lista já conferiu ao abrir; evita buscar de novo. */
  private readonly conferida = this.router.getCurrentNavigation()?.extras.state?.['branch'] as Branch | undefined;

  status: LoadStatus = 'loading';
  branch: Branch | null = null;
  activeTab = 0;

  @ViewChild(BranchRegisterComponent) private register?: BranchRegisterComponent;
  @ViewChild(TabView) private tabView?: TabView;

  /** Usado pelo guard da rota: em edição no Cadastro, só sai depois de confirmar. */
  podeSair(): Promise<boolean> | boolean {
    return this.register?.confirmarSaida() ?? true;
  }

  /**
   * O usuário clicou numa aba. Saindo do Cadastro em edição, a aba volta para o Cadastro e o diálogo de saída
   * aparece; "Sair" descarta a edição e abre a aba escolhida.
   */
  onTabChange(index: number): void {
    if (this.activeTab !== 0 || !this.register?.editing) {
      this.activeTab = index;
      return;
    }

    this.voltarAba();
    this.register.confirmarSaida().then((pode) => {
      if (pode) this.activeTab = index;
    });
  }

  /**
   * Desfaz a troca de aba que o p-tabView já fez. A primeira atribuição só consome a trava interna que ele
   * liga ao emitir a troca; a segunda reseleciona a aba atual.
   */
  private voltarAba(): void {
    if (!this.tabView) return;
    this.tabView.activeIndex = this.activeTab;
    this.tabView.activeIndex = this.activeTab;
  }

  ngOnInit(): void {
    // link direto para uma aba: /filial/PRO?aba=almoxarifado ou ?aba=repositorio
    const abas: Record<string, number> = { almoxarifado: 1, repositorio: 2 };
    this.activeTab = abas[this.route.snapshot.queryParamMap.get('aba') ?? ''] ?? 0;

    this.route.paramMap
      .pipe(
        map((params) => params.get('codigo') ?? ''),
        // depois de salvar com outro código a URL muda; a filial já está carregada, não recarrega
        filter((codigo) => codigo !== this.branch?.codigo),
        tap(() => (this.status = 'loading')),
        switchMap((codigo) => (this.conferida?.codigo === codigo ? of({ ...this.conferida }) : this.service.obter(codigo))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (branch) => {
          if (!branch) {
            this.voltarComErro();
            return;
          }
          this.branch = branch;
          this.status = 'ready';
        },
        error: () => this.voltarComErro()
      });
  }

  /** Cadastro gravado: a lateral mostra os valores novos; código alterado troca a URL sem recarregar. */
  onSaved(atualizada: Branch): void {
    const codigoAnterior = this.branch?.codigo;
    this.branch = atualizada;
    if (atualizada.codigo !== codigoAnterior) {
      this.router.navigate(['/filial', atualizada.codigo], { replaceUrl: true });
    }
  }

  /** Filial não encontrada ou erro ao carregar: volta para a lista (sem deixar a URL ruim no histórico) e avisa. */
  private voltarComErro(): void {
    this.messages.add({ severity: 'error', summary: this.translate.instant('iclass.generic.label.could-not-load-branch'), life: 6000 });
    this.router.navigate(['/filial'], { replaceUrl: true });
  }
}
