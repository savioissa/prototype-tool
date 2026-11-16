import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { TesteEstadoService } from '../teste-estado.service';

/** Registro dos outputs disparados pelo componente no palco, mais recentes no topo. */
@Component({
  selector: 'proto-teste-eventos',
  standalone: true,
  imports: [DatePipe],
  template: `
    <ol class="proto-eventos__lista">
      @for (evento of estado.eventos(); track $index) {
        <li class="proto-eventos__linha">
          <span class="proto-eventos__hora">{{ evento.hora | date: 'HH:mm:ss' }}</span>
          <span class="proto-eventos__output">{{ evento.output }}</span>
          <code class="proto-eventos__valor">{{ evento.valor }}</code>
        </li>
      } @empty {
        <li class="proto-eventos__vazio">Nenhum output disparado ainda.</li>
      }
    </ol>
  `,
  styles: `
    :host {
      display: block;
      font-size: 0.75rem;
    }

    .proto-eventos__lista {
      max-height: 220px;
      margin: 0;
      padding: 0;
      overflow: auto;
      list-style: none;
    }

    .proto-eventos__linha {
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr);
      gap: 8px;
      padding: 4px 0;
      border-bottom: 1px solid #f1f2f4;
    }

    .proto-eventos__hora {
      color: var(--text-color-secondary);
      font-variant-numeric: tabular-nums;
    }

    .proto-eventos__output {
      font-weight: 600;
    }

    .proto-eventos__valor {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text-color-secondary);
    }

    .proto-eventos__vazio {
      color: var(--text-color-secondary);
    }
  `,
})
export class EventosComponent {
  protected readonly estado = inject(TesteEstadoService);
}
