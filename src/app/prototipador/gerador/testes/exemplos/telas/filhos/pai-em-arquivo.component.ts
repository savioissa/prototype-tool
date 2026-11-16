import { Component } from '@angular/core';

// Template em arquivo, com filhos em @for, @defer, *ngIf e seletor de atributo (teste 3 do gerador).
@Component({
  selector: 'ex-pai-em-arquivo',
  standalone: true,
  templateUrl: './pai-em-arquivo.component.html',
})
export class PaiEmArquivoComponent {
  itens = [1, 2];
}
