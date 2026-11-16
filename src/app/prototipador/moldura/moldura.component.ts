import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { ExibirTagsService } from '../principal/exibir-tags.service';
import { SeletorIdiomaComponent } from '../principal/seletor-idioma.component';
import { gravar, ler } from './armazenamento';
import { TelaAtualService } from './tela-atual.service';

const CHAVE_MENU = 'proto.menuRecolhido';

interface ItemDoMenu {
  rotulo: string;
  icone: string;
  destino: string;
  ativo: boolean;
}

@Component({
  selector: 'proto-moldura',
  standalone: true,
  imports: [NgClass, RouterOutlet, SeletorIdiomaComponent],
  templateUrl: './moldura.component.html',
  styleUrl: './moldura.component.css',
  host: { '[class.proto-moldura--aberta]': '!recolhido()' },
})
export class MolduraComponent {
  private readonly router = inject(Router);
  private readonly telaAtual = inject(TelaAtualService);

  // Fechado (só ícones) por padrão, como no layout de referência.
  protected readonly recolhido = signal<boolean>(ler<unknown>(CHAVE_MENU, true) !== false);

  private readonly url = signal(this.router.url);

  protected readonly itens = computed<ItemDoMenu[]>(() => {
    const url = this.url();
    const naPrincipal = !url.startsWith('/_proto');
    return [
      { rotulo: 'Principal', icone: 'pi-desktop', destino: this.telaAtual.tela()?.url ?? '/', ativo: naPrincipal },
      { rotulo: 'Área de teste', icone: 'pi-box', destino: '/_proto/teste', ativo: url.startsWith('/_proto/teste') },
      { rotulo: 'Dados', icone: 'pi-sitemap', destino: '/_proto/dados', ativo: url.startsWith('/_proto/dados') },
      { rotulo: 'Traduções', icone: 'pi-language', destino: '/_proto/traducoes', ativo: url.startsWith('/_proto/traducoes') },
    ];
  });

  constructor() {
    // Criado aqui para que o idioma e o modo "exibir tags" guardados valham desde a primeira tela.
    inject(ExibirTagsService);
    this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe((evento) => this.url.set(evento.urlAfterRedirects));
  }

  protected navegar(evento: MouseEvent, destino: string): void {
    // Deixa o navegador tratar ctrl+clique e afins (abrir em nova aba).
    if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey) {
      return;
    }
    evento.preventDefault();
    this.router.navigateByUrl(destino).catch(() => {
      // A tela atual guardada pode não existir mais (rota removida ou renomeada): esquece e vai para o início.
      this.telaAtual.esquecer();
      this.router.navigateByUrl('/');
    });
  }

  protected alternarMenu(): void {
    this.recolhido.update((valor) => !valor);
    gravar(CHAVE_MENU, this.recolhido());
  }
}
