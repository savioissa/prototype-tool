import { Component, inject, signal } from '@angular/core';

import { gravar, ler } from '../moldura/armazenamento';
import { ControlesComponent } from './controles/controles.component';
import { ListaComponent } from './lista/lista.component';
import { PalcoComponent } from './palco/palco.component';
import { TesteEstadoService } from './teste-estado.service';

const CHAVE_CONTROLES = 'proto.teste.controlesAbertos';

/** Aba Área de teste: o palco ocupa a área toda; árvore e controles abrem por cima dele. */
@Component({
  selector: 'proto-teste',
  standalone: true,
  imports: [ListaComponent, PalcoComponent, ControlesComponent],
  providers: [TesteEstadoService],
  template: `
    <div class="proto-teste__barra">
      <button
        type="button"
        class="proto-teste__botao"
        [class.proto-teste__botao--ativo]="arvoreAberta()"
        [attr.aria-expanded]="arvoreAberta()"
        (click)="arvoreAberta.set(!arvoreAberta())"
      >
        <i class="pi pi-sitemap"></i> Componentes
      </button>
      @if (estado.selecionado(); as componente) {
        <span class="proto-teste__atual">{{ componente.id }}</span>
      }
      <button
        type="button"
        class="proto-teste__botao"
        [class.proto-teste__botao--ativo]="controlesAbertos()"
        [attr.aria-expanded]="controlesAbertos()"
        (click)="alternarControles()"
      >
        <i class="pi pi-sliders-h"></i> Controles
        @if (estado.eventos().length) {
          <span class="proto-teste__contagem">{{ estado.eventos().length }}</span>
        }
      </button>
    </div>

    <div class="proto-teste__corpo">
      <proto-teste-palco class="proto-teste__palco" />
      @if (arvoreAberta()) {
        <proto-teste-lista class="proto-teste__painel proto-teste__painel--esquerda" (escolher)="arvoreAberta.set(false)" (fechar)="arvoreAberta.set(false)" />
      }
      @if (controlesAbertos()) {
        <proto-teste-controles class="proto-teste__painel proto-teste__painel--direita" (fechar)="alternarControles()" />
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    .proto-teste__barra {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      height: 44px;
      padding: 0 8px;
      border-bottom: 1px solid #e4e6ea;
    }

    .proto-teste__botao {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 30px;
      padding: 0 10px;
      border: none;
      border-radius: 6px;
      background: none;
      color: var(--text-color);
      font: inherit;
      font-size: 0.8125rem;
      cursor: pointer;
    }

    .proto-teste__botao:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .proto-teste__botao--ativo,
    .proto-teste__botao--ativo:hover {
      background: rgba(0, 0, 0, 0.06);
      color: var(--primary-color);
    }

    .proto-teste__botao .pi {
      font-size: 0.8125rem;
    }

    .proto-teste__atual {
      min-width: 0;
      overflow: hidden;
      color: var(--text-color-secondary);
      font-size: 0.8125rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .proto-teste__contagem {
      min-width: 18px;
      padding: 0 4px;
      border-radius: 9px;
      background: var(--primary-color);
      color: #fff;
      font-size: 0.6875rem;
      line-height: 18px;
      text-align: center;
    }

    .proto-teste__corpo {
      position: relative;
      flex: 1;
      min-height: 0;
    }

    /* isolation: os z-index da tela ficam contidos no palco e não passam por cima dos painéis. */
    .proto-teste__palco {
      position: absolute;
      inset: 0;
      overflow: auto;
      isolation: isolate;
    }

    .proto-teste__painel {
      position: absolute;
      top: 8px;
      bottom: 8px;
      z-index: 1;
      box-sizing: border-box;
      max-width: calc(100% - 16px);
      overflow: auto;
      border: 1px solid #e4e6ea;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    }

    .proto-teste__painel--esquerda {
      left: 8px;
      width: 300px;
    }

    .proto-teste__painel--direita {
      right: 8px;
      width: 360px;
    }
  `,
})
export class TesteComponent {
  protected readonly estado = inject(TesteEstadoService);

  // A árvore começa aberta só quando ainda não há componente escolhido.
  protected readonly arvoreAberta = signal(!this.estado.selecionado());
  protected readonly controlesAbertos = signal<boolean>(ler<unknown>(CHAVE_CONTROLES, false) === true);

  protected alternarControles(): void {
    this.controlesAbertos.update((valor) => !valor);
    gravar(CHAVE_CONTROLES, this.controlesAbertos());
  }
}
