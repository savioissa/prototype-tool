import { AfterViewInit, Component, ElementRef, ViewChild, signal } from '@angular/core';

import { SCHEMA } from '../gerado/schema.gerado';
import { textoDoDiagrama } from './diagrama';

const ZOOM_MINIMO = 0.2;
const ZOOM_MAXIMO = 3;

/** Aba Dados: diagrama de entidades e relacionamentos inferido das telas. Somente leitura. */
@Component({
  selector: 'proto-dados',
  standalone: true,
  templateUrl: './dados.component.html',
  styleUrl: './dados.component.css',
})
export class DadosComponent implements AfterViewInit {
  protected readonly schema = SCHEMA;
  protected readonly confirmados = SCHEMA.relacionamentos.filter((r) => r.confianca === 'alta').length;
  protected readonly carregando = signal(SCHEMA.entidades.length > 0);
  protected readonly erro = signal<string | null>(null);
  protected readonly avisosAbertos = signal(false);

  @ViewChild('janela') private readonly janela?: ElementRef<HTMLElement>;
  @ViewChild('desenho') private readonly desenho?: ElementRef<HTMLElement>;

  protected readonly zoom = signal(1);
  protected readonly deslocamento = signal({ x: 0, y: 0 });
  private arrasto: { x: number; y: number; inicio: { x: number; y: number } } | null = null;

  async ngAfterViewInit(): Promise<void> {
    if (!this.schema.entidades.length) {
      return;
    }
    try {
      // Carregado sob demanda: o Mermaid só entra no bundle desta aba.
      const { default: mermaid } = await import('mermaid');
      mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict', er: { useMaxWidth: false } });
      const { svg } = await mermaid.render(`proto-diagrama-${Date.now()}`, textoDoDiagrama(this.schema));
      this.desenho!.nativeElement.innerHTML = svg;
      this.carregando.set(false);
      requestAnimationFrame(() => this.ajustar());
    } catch (erro) {
      this.carregando.set(false);
      this.erro.set(erro instanceof Error ? erro.message : String(erro));
    }
  }

  protected aproximar(fator: number): void {
    const janela = this.janela?.nativeElement.getBoundingClientRect();
    if (janela) {
      this.zoomEm(fator, janela.width / 2, janela.height / 2);
    }
  }

  /** Enquadra o diagrama inteiro na janela. */
  protected ajustar(): void {
    const svg = this.desenho?.nativeElement.querySelector('svg');
    const janela = this.janela?.nativeElement;
    if (!svg || !janela) {
      return;
    }
    const largura = svg.viewBox.baseVal?.width || svg.getBoundingClientRect().width / this.zoom();
    const altura = svg.viewBox.baseVal?.height || svg.getBoundingClientRect().height / this.zoom();
    svg.setAttribute('width', String(largura));
    svg.setAttribute('height', String(altura));
    // Margem embaixo maior: a legenda fica fixa no canto inferior.
    const margem = 32;
    const espacoDaLegenda = 64;
    const alturaUtil = janela.clientHeight - margem * 2 - espacoDaLegenda;
    const escala = limitar(Math.min((janela.clientWidth - margem * 2) / largura, alturaUtil / altura));
    this.zoom.set(escala);
    this.deslocamento.set({
      x: (janela.clientWidth - largura * escala) / 2,
      y: margem + (alturaUtil - altura * escala) / 2,
    });
  }

  protected rolar(evento: WheelEvent): void {
    evento.preventDefault();
    const janela = this.janela!.nativeElement.getBoundingClientRect();
    this.zoomEm(evento.deltaY < 0 ? 1.1 : 1 / 1.1, evento.clientX - janela.left, evento.clientY - janela.top);
  }

  protected comecarArrasto(evento: PointerEvent): void {
    if (evento.button !== 0) {
      return;
    }
    (evento.currentTarget as HTMLElement).setPointerCapture(evento.pointerId);
    this.arrasto = { x: evento.clientX, y: evento.clientY, inicio: this.deslocamento() };
  }

  protected arrastar(evento: PointerEvent): void {
    if (this.arrasto) {
      const { x, y, inicio } = this.arrasto;
      this.deslocamento.set({ x: inicio.x + evento.clientX - x, y: inicio.y + evento.clientY - y });
    }
  }

  protected terminarArrasto(): void {
    this.arrasto = null;
  }

  /** Zoom mantendo parado o ponto (x, y) da janela. */
  private zoomEm(fator: number, x: number, y: number): void {
    const atual = this.zoom();
    const novo = limitar(atual * fator);
    const { x: dx, y: dy } = this.deslocamento();
    this.deslocamento.set({ x: x - ((x - dx) * novo) / atual, y: y - ((y - dy) * novo) / atual });
    this.zoom.set(novo);
  }
}

function limitar(zoom: number): number {
  return Math.min(ZOOM_MAXIMO, Math.max(ZOOM_MINIMO, zoom));
}
