import { Component } from '@angular/core';

// Template em linha e a mesma chave de outro componente (acao.salvar).
@Component({
  selector: 'ex-textos-em-linha',
  standalone: true,
  template: `
    <button type="button">{{ 'acao.salvar' | translate }}</button>
  `,
})
export class TextosEmLinhaComponent {}
