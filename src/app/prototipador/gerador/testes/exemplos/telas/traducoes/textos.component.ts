import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';

// Uma forma de uso de tag por linha (teste 5 do gerador).
@Component({
  selector: 'ex-textos',
  standalone: true,
  templateUrl: './textos.component.html',
})
export class TextosComponent {
  private readonly traducao = inject(TranslateService);
  private readonly mensagens = inject(MessageService);
  private readonly confirmacao = inject(ConfirmationService);

  usuario = 'Ana';
  itens: string[] = [];
  modo = 'a';
  mostrar = true;
  estado = 'ativo';
  ativo = true;
  coluna = { header: 'coluna.codigo' };
  rotulo = 'codigo.provavel';
  naoEChave = 'texto qualquer';

  avisar(): void {
    this.mensagens.add({ severity: 'info', summary: this.traducao.instant('ts.toast') });
  }

  confirmar(): void {
    this.confirmacao.confirm({ message: this.traducao.instant('ts.confirmacao') });
  }

  montar(): string {
    return this.traducao.instant('ts.montado');
  }

  buscar(): void {
    this.traducao.get(['ts.lista.a', 'ts.lista.b']).subscribe();
    this.traducao.stream('ts.stream').subscribe();
  }

  dinamica(sufixo: string): string {
    return this.traducao.instant('ts.' + sufixo);
  }
}
