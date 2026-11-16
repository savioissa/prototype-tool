import { Directive, Input } from '@angular/core';

@Directive()
export abstract class BaseEntradas {
  @Input() herdado: string | null = null;
  @Input() sobrescrito = 'da base';
}
