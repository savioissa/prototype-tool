import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

import type { Campo, InputRegistrado } from '../../modelo/tipos';
import { EventosComponent } from '../eventos/eventos.component';
import { TesteEstadoService } from '../teste-estado.service';
import { CampoComponent } from './campo.component';

type Secao = 'estado' | 'inputs' | 'eventos';

/** Todos os controles num só painel, aberto por cima do palco: estado, inputs e eventos. */
@Component({
  selector: 'proto-teste-controles',
  standalone: true,
  imports: [FormsModule, DropdownModule, CampoComponent, EventosComponent],
  templateUrl: './controles.component.html',
  styleUrl: './controles.component.css',
})
export class ControlesComponent {
  protected readonly estado = inject(TesteEstadoService);
  @Output() fechar = new EventEmitter<void>();

  protected readonly secoesRecolhidas = signal(new Set<Secao>());
  protected readonly nomesDosEstados = computed(() => this.estado.estados().map((estado) => estado.nome));

  protected alternarSecao(secao: Secao): void {
    this.secoesRecolhidas.update((recolhidas) => {
      const novas = new Set(recolhidas);
      if (novas.has(secao)) {
        novas.delete(secao);
      } else {
        novas.add(secao);
      }
      return novas;
    });
  }

  protected definicao(input: InputRegistrado): Campo {
    return { nome: input.nome, tipo: input.tipo, opcional: input.opcional, aceitaNulo: input.aceitaNulo };
  }

  /** O valor aplicado; se nada definiu o input, o padrão do componente, quando conhecido. */
  protected valorDe(input: InputRegistrado): unknown {
    const valores = this.estado.valores();
    return input.nome in valores ? valores[input.nome] : input.padrao;
  }

  protected marcadorDe(input: InputRegistrado): string | null {
    if (input.nome in this.estado.edicoes()) return 'editado';
    if (input.nome in this.estado.valoresDoEstado()) return 'do estado';
    return 'padrão do componente';
  }
}
