import {
  ApplicationRef,
  Component,
  ComponentRef,
  EnvironmentInjector,
  EnvironmentProviders,
  Injector,
  NgZone,
  OnDestroy,
  Provider,
  Type,
  ViewChild,
  ViewContainerRef,
  computed,
  createEnvironmentInjector,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { filter, first } from 'rxjs';

import type { ComponenteRegistrado } from '../../modelo/tipos';
import { TesteEstadoService } from '../teste-estado.service';

/** Espera sem novas edições antes de aplicá-las ao componente. */
const ESPERA_DE_EDICAO_MS = 150;
/** Limite de espera pela tela estabilizar antes da ação do usuário. */
const ESPERA_MAXIMA_DA_ACAO_MS = 3000;

interface Assinatura {
  unsubscribe(): void;
}

/** Renderiza o componente escolhido sozinho, no estado escolhido e com as edições. */
@Component({
  selector: 'proto-teste-palco',
  standalone: true,
  templateUrl: './palco.component.html',
  styleUrl: './palco.component.css',
})
export class PalcoComponent implements OnDestroy {
  protected readonly estado = inject(TesteEstadoService);
  private readonly injetorDeAmbiente = inject(EnvironmentInjector);
  private readonly aplicacao = inject(ApplicationRef);
  private readonly zona = inject(NgZone);

  @ViewChild('ancora', { read: ViewContainerRef, static: true })
  private readonly ancora!: ViewContainerRef;

  protected readonly erro = signal<string | null>(null);
  protected readonly largura = computed(() => {
    const largura = this.estado.ajuste()?.largura;
    return typeof largura === 'number' ? `${largura}px` : (largura ?? '100%');
  });

  private ref: ComponentRef<unknown> | null = null;
  private injetorCriado: EnvironmentInjector | null = null;
  private assinaturas: Assinatura[] = [];
  /** Valores já aplicados com setInput, para só reaplicar o que mudou. */
  private aplicados: Record<string, unknown> = {};
  /** Valores da última criação; depois de uma falha, só vale tentar de novo se mudarem. */
  private valoresTentados: Record<string, unknown> | null = null;
  private tentativa = 0;
  private espera: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // O estado muda a versão ao trocar de componente ou de estado e ao restaurar.
    effect(() => {
      if (this.estado.versao() > 0) {
        untracked(() => this.recriar(this.estado.selecionado()));
      }
    });

    effect(() => {
      const valores = this.estado.valores();
      clearTimeout(this.espera);
      this.espera = setTimeout(() => this.atualizar(valores), ESPERA_DE_EDICAO_MS);
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.espera);
    this.destruir();
  }

  private async recriar(componente: ComponenteRegistrado | null): Promise<void> {
    const tentativa = ++this.tentativa;
    this.destruir();
    this.erro.set(null);
    if (!componente) {
      return;
    }

    let classe: unknown;
    try {
      classe = await componente.carregar();
    } catch (erro) {
      if (tentativa === this.tentativa) {
        this.erro.set(mensagemDe(erro));
      }
      return;
    }
    // Outro componente foi pedido enquanto este carregava.
    if (tentativa !== this.tentativa) {
      return;
    }

    const ajuste = this.estado.ajuste();
    const estadoAtual = this.estado.estado();
    this.valoresTentados = untracked(() => this.estado.valores());
    try {
      // Provedores comuns entram num injetor de elemento, para vencer o que vem da árvore da
      // área de teste (ex.: ActivatedRoute); os de ambiente (provideX) num injetor de ambiente.
      const provedores = [...(ajuste?.provedores ?? []), ...estadoAtual.provedores];
      const deAmbiente = provedores.filter(ehDeAmbiente);
      const comuns = provedores.filter((provedor): provedor is Provider => !ehDeAmbiente(provedor));
      this.injetorCriado = createEnvironmentInjector(deAmbiente, this.injetorDeAmbiente);
      this.ref = this.ancora.createComponent(classe as Type<unknown>, {
        injector: Injector.create({ providers: comuns, parent: this.ancora.injector }),
        environmentInjector: this.injetorCriado,
        projectableNodes: ajuste?.conteudo === undefined ? undefined : [[document.createTextNode(ajuste.conteudo)]],
      });
      this.assinarSaidas(componente);
      this.aplicar(componente, this.valoresTentados);

      // A ação do usuário vem depois que a tela termina de carregar, como aconteceria de verdade.
      if (estadoAtual.acao) {
        await this.esperarEstabilizar();
        if (tentativa !== this.tentativa || !this.ref) {
          return;
        }
        await estadoAtual.acao(this.ref.instance);
        if (tentativa === this.tentativa && this.ref) {
          this.ref.changeDetectorRef.detectChanges();
        }
      }
    } catch (erro) {
      if (tentativa === this.tentativa) {
        this.falhar(erro);
      }
    }
  }

  /** Espera não haver carregamento nem tarefa pendente (ou o limite), sem segurar a estabilidade com o próprio timer. */
  private esperarEstabilizar(): Promise<void> {
    // Os dois avisos chegam fora da zona do Angular; a ação continua dentro dela, para a tela se atualizar.
    return new Promise((resolver) => {
      const continuar = () => this.zona.run(() => resolver());
      const assinatura = this.aplicacao.isStable.pipe(filter(Boolean), first()).subscribe(continuar);
      this.zona.runOutsideAngular(() =>
        setTimeout(() => {
          assinatura.unsubscribe();
          continuar();
        }, ESPERA_MAXIMA_DA_ACAO_MS),
      );
    });
  }

  /** Aplica as edições. Se algum input deixou de ser definido, só recriando volta ao padrão do componente. */
  private atualizar(valores: Record<string, unknown>): void {
    const componente = this.estado.selecionado();
    if (!componente) {
      return;
    }
    // Depois de uma falha não há componente: a edição pode ser justamente o que faltava (ex.: input obrigatório).
    if (!this.ref) {
      if (this.erro() && valores !== this.valoresTentados) {
        this.recriar(componente);
      }
      return;
    }
    const removidos = Object.keys(this.aplicados).some((nome) => !(nome in valores));
    if (removidos) {
      this.recriar(componente);
      return;
    }
    try {
      this.aplicar(componente, valores);
    } catch (erro) {
      this.falhar(erro);
    }
  }

  private aplicar(componente: ComponenteRegistrado, valores: Record<string, unknown>): void {
    const ref = this.ref!;
    const nomes = new Set(componente.inputs.map((input) => input.nome));
    for (const [nome, valor] of Object.entries(valores)) {
      if (!nomes.has(nome)) {
        continue;
      }
      if (!(nome in this.aplicados) || !Object.is(this.aplicados[nome], valor)) {
        ref.setInput(nome, valor);
        this.aplicados[nome] = valor;
      }
    }
    ref.changeDetectorRef.detectChanges();
  }

  private assinarSaidas(componente: ComponenteRegistrado): void {
    const instancia = this.ref!.instance as Record<string, unknown>;
    for (const output of componente.outputs) {
      const emissor = instancia[output.propriedade] as { subscribe?: (fn: (valor: unknown) => void) => Assinatura };
      if (typeof emissor?.subscribe === 'function') {
        this.assinaturas.push(emissor.subscribe((valor) => this.estado.registrarEvento(output.nome, valor)));
      }
    }
  }

  private falhar(erro: unknown): void {
    console.warn('[proto] Falha ao renderizar o componente na área de teste.', erro);
    this.destruir();
    this.erro.set(mensagemDe(erro));
  }

  private destruir(): void {
    this.assinaturas.forEach((assinatura) => assinatura.unsubscribe());
    this.assinaturas = [];
    this.ref?.destroy();
    this.ref = null;
    this.injetorCriado?.destroy();
    this.injetorCriado = null;
    this.aplicados = {};
    this.ancora?.clear();
  }
}

/** `provideHttpClient()` e afins só valem num injetor de ambiente. */
function ehDeAmbiente(provedor: Provider | EnvironmentProviders): provedor is EnvironmentProviders {
  return !!provedor && typeof provedor === 'object' && 'ɵproviders' in provedor;
}

function mensagemDe(erro: unknown): string {
  return erro instanceof Error ? erro.message : String(erro);
}
