import { Component, EventEmitter, Input, Output, input, model, output } from '@angular/core';

import { BaseEntradas } from './base';

// Uma forma de input e de output por propriedade (teste 1 do gerador).
@Component({
  selector: 'ex-entradas',
  standalone: true,
  template: '',
})
export class EntradasComponent extends BaseEntradas {
  @Input() simples = 'a';
  @Input('apelido') comAlias = 0;
  @Input({ alias: 'apelidoObjeto' }) comAliasObjeto = false;
  @Input({ required: true }) obrigatorio!: string;
  @Input() override sobrescrito = 'da classe';
  @Input() set comSetter(valor: number) {}
  @Input() lista = [1, 2];
  @Input() objeto = { nome: 'x', ativo: true };
  @Input() calculado = Date.now();

  sinal = input<string>();
  sinalComValor = input(10);
  sinalComAlias = input('x', { alias: 'sinalApelido' });
  sinalObrigatorio = input.required<boolean>();
  sinalObrigatorioComAlias = input.required<number>({ alias: 'obrigatorioApelido' });
  modelo = model('m');

  @Output() clicou = new EventEmitter<void>();
  @Output('apelidoSaida') saiu = new EventEmitter<number>();
  mudou = output<string>();
  mudouComAlias = output<string>({ alias: 'mudouApelido' });
}
