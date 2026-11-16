import { Component } from '@angular/core';

// Template em linha, com um filho dentro de bloco de controle (teste 3 do gerador).
@Component({
  selector: 'ex-pai-em-linha',
  standalone: true,
  template: `
    <ex-filho-a />
    @if (mostrar) {
      <ex-filho-b></ex-filho-b>
    }
  `,
})
export class PaiEmLinhaComponent {
  mostrar = true;
}
