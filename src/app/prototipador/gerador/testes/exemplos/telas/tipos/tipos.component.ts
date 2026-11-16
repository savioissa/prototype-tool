import { Component, Input, Signal, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';

export enum Cor {
  Azul = 'azul',
  Verde = 'verde',
}

export enum Nivel {
  Baixo,
  Alto,
}

export interface Endereco {
  rua: string;
  numero?: number;
  complemento: string | null;
}

export class Ponto {
  x = 0;
  y = 0;
}

export class ComMetodo {
  valor = 0;
  dobrar(): number {
    return this.valor * 2;
  }
}

export interface No {
  nome: string;
  filhos: No[];
}

export interface N1 { n2: N2 }
export interface N2 { n3: N3 }
export interface N3 { n4: N4 }
export interface N4 { n5: N5 }
export interface N5 { n6: N6 }
export interface N6 { fundo: string }

type Apelido = 'p' | 'q';

// Uma linha da tabela de tipos por input (teste 2 do gerador).
@Component({
  selector: 'ex-tipos',
  standalone: true,
  template: '',
})
export class TiposComponent<T> {
  @Input() texto!: string;
  @Input() numero!: number;
  @Input() booleano!: boolean;
  @Input() data!: Date;
  @Input() opcoesTexto!: 'a' | 'b';
  @Input() opcoesNumero!: 1 | 2;
  @Input() opcoesApelido!: Apelido;
  @Input() enumTexto!: Cor;
  @Input() enumNumero!: Nivel;
  @Input() lista!: string[];
  @Input() listaGenerica!: Array<number>;
  @Input() listaSomenteLeitura!: ReadonlyArray<string>;
  @Input() interface!: Endereco;
  @Input() literal!: { x: number };
  @Input() classeDeDados!: Ponto;
  @Input() nulo!: string | null;
  @Input() indefinido: string | undefined;
  @Input() interrogacao?: number;
  @Input() funcao!: () => void;
  @Input() template!: TemplateRef<unknown>;
  @Input() observavel!: Observable<string>;
  @Input() sinal!: Signal<number>;
  @Input() qualquer: any;
  @Input() desconhecido: unknown;
  @Input() generico!: T;
  @Input() uniaoMista!: string | number;
  @Input() classeComMetodo!: ComMetodo;
  @Input() autoReferente!: No;
  @Input() profundo!: N1;
  @Input() dicionario!: Record<string, number>;
}
