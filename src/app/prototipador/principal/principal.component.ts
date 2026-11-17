import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Aba Principal: a tela rodando normalmente, dentro do cartão de conteúdo.
 * Quando nenhuma rota de tela está ativa (projeto ainda sem telas, ou URL `/` sem
 * redirecionamento), mostra um estado vazio em vez de uma área em branco.
 */
@Component({
  selector: 'proto-principal',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet (activate)="temTela.set(true)" (deactivate)="temTela.set(false)" />
    @if (!temTela()) {
      <div class="proto-principal-vazio">
        <i class="pi pi-desktop proto-principal-vazio__icone" aria-hidden="true"></i>
        <p class="proto-principal-vazio__titulo">Nenhuma tela aberta</p>
        <p class="proto-principal-vazio__texto">
          Crie a primeira tela em <code>src/app/telas/</code> e registre a rota em
          <code>rotasDasTelas</code>, no arquivo <code>app.routes.ts</code>.
        </p>
      </div>
    }
  `,
  styles: `
    .proto-principal-vazio {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 100%;
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--text-color-secondary);
    }

    .proto-principal-vazio__icone {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .proto-principal-vazio__titulo {
      margin: 0;
      font-weight: 600;
      color: var(--text-color);
    }

    .proto-principal-vazio__texto {
      max-width: 28rem;
      margin: 0;
      line-height: 1.5;
    }
  `,
})
export class PrincipalComponent {
  protected readonly temTela = signal(false);
}
