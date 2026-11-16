import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Aba Principal: a tela rodando normalmente, dentro do cartão de conteúdo. */
@Component({
  selector: 'proto-principal',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class PrincipalComponent {}
