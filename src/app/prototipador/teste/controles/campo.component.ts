import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

import type { Campo, TipoCampo } from '../../modelo/tipos';
import type { Limite } from '../ajustar';
import { valorInicial } from '../valores';

/**
 * Um campo do formulário de inputs. Objetos e listas se desdobram em campos menores, do mesmo
 * componente. Nunca altera o valor recebido: emite um valor novo a cada edição.
 */
@Component({
  selector: 'proto-campo',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    InputSwitchModule,
    InputTextModule,
    InputTextareaModule,
  ],
  templateUrl: './campo.component.html',
  styleUrl: './campo.component.css',
})
export class CampoComponent {
  @Input({ required: true }) definicao!: Campo;
  @Input() valor: unknown;
  /** Caminho usado em `limites` e `tipos`: `branch.name`, `branches[].name`. */
  @Input({ required: true }) caminho!: string;
  @Input() limites: Record<string, Limite> = {};
  @Input() tipos: Record<string, TipoCampo> = {};
  /** Rótulo extra ao lado do nome (ex.: "padrão" quando nada definiu o input). */
  @Input() marcador: string | null = null;
  @Output() alterar = new EventEmitter<unknown>();

  protected aberto = true;

  /** O ajuste pode corrigir o tipo de um caminho. */
  protected get tipo(): TipoCampo {
    return this.tipos[this.caminho] ?? this.definicao.tipo;
  }

  protected get limite(): Limite | undefined {
    return this.limites[this.caminho];
  }

  protected get vazio(): boolean {
    return this.valor === undefined || this.valor === null;
  }

  // ---------- texto ----------

  protected get texto(): string {
    return typeof this.valor === 'string' ? this.valor : '';
  }

  /** Quantidade usada no contador: caracteres no texto, valor no número, itens na lista. */
  protected get medida(): number | null {
    if (this.tipo.tipo === 'texto') return this.texto.length;
    if (this.tipo.tipo === 'numero') return typeof this.valor === 'number' ? this.valor : null;
    if (this.tipo.tipo === 'lista') return Array.isArray(this.valor) ? this.valor.length : 0;
    return null;
  }

  protected get foraDoLimite(): boolean {
    const medida = this.medida;
    const limite = this.limite;
    if (medida === null || !limite) {
      return false;
    }
    return (limite.min !== undefined && medida < limite.min) || (limite.max !== undefined && medida > limite.max);
  }

  /** Texto, número e lista sempre mostram o contador; com limite, também o máximo e o mínimo. */
  protected get textoDoContador(): string | null {
    const medida = this.medida;
    if (medida === null) {
      return null;
    }
    const { min, max } = this.limite ?? {};
    if (this.tipo.tipo === 'numero') {
      return min === undefined && max === undefined ? null : `entre ${min ?? '−∞'} e ${max ?? '∞'}`;
    }
    const unidade = this.tipo.tipo === 'texto' ? 'caracteres' : 'itens';
    const maximo = max === undefined ? '' : `/${max}`;
    const minimo = min === undefined ? '' : ` · mínimo ${min}`;
    return `${medida}${maximo} ${unidade}${minimo}`;
  }

  // ---------- número, data e opções ----------

  protected alterarNumero(texto: string | number | null): void {
    // Campo numérico apagado deixa o input indefinido.
    if (texto === null || texto === '') {
      this.alterar.emit(undefined);
      return;
    }
    const numero = Number(texto);
    if (!Number.isNaN(numero)) {
      this.alterar.emit(numero);
    }
  }

  protected get data(): Date | null {
    if (this.valor instanceof Date) return this.valor;
    if (typeof this.valor === 'string' || typeof this.valor === 'number') {
      const data = new Date(this.valor);
      return Number.isNaN(data.getTime()) ? null : data;
    }
    return null;
  }

  protected get opcoes(): { rotulo: string; valor: string | number }[] {
    return this.tipo.tipo === 'opcoes' ? this.tipo.valores.map((valor) => ({ rotulo: String(valor), valor })) : [];
  }

  // ---------- objeto ----------

  protected get campos(): Campo[] {
    return this.tipo.tipo === 'objeto' ? this.tipo.campos : [];
  }

  protected get objeto(): Record<string, unknown> {
    return this.valor && typeof this.valor === 'object' ? (this.valor as Record<string, unknown>) : {};
  }

  protected alterarAtributo(campo: Campo, valor: unknown): void {
    const novo = { ...this.objeto };
    // Dentro de um objeto, indefinido é atributo ausente.
    if (valor === undefined) {
      delete novo[campo.nome];
    } else {
      novo[campo.nome] = valor;
    }
    this.alterar.emit(novo);
  }

  // ---------- lista ----------

  protected get itens(): unknown[] {
    return Array.isArray(this.valor) ? this.valor : [];
  }

  protected get definicaoDoItem(): Campo {
    const item: TipoCampo = this.tipo.tipo === 'lista' ? this.tipo.item : { tipo: 'texto' };
    return { nome: 'item', tipo: item, opcional: false, aceitaNulo: false };
  }

  protected alterarItem(indice: number, valor: unknown): void {
    const novos = [...this.itens];
    novos[indice] = valor;
    this.alterar.emit(novos);
  }

  protected adicionarItem(): void {
    this.alterar.emit([...this.itens, valorInicial(this.definicaoDoItem.tipo)]);
  }

  protected removerItem(indice: number): void {
    this.alterar.emit(this.itens.filter((_, i) => i !== indice));
  }

  // ---------- ações ----------

  protected preencher(): void {
    this.alterar.emit(valorInicial(this.tipo));
  }
}
