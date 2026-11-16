// Único módulo do gerador que usa o analisador de templates do @angular/compiler.
// A API muda entre versões do Angular; conferida contra a 17.3.
import {
  AST,
  ASTWithSource,
  BindingPipe,
  Conditional,
  CssSelector,
  LiteralPrimitive,
  RecursiveAstVisitor,
  SelectorMatcher,
  TmplAstBoundText,
  TmplAstDeferredBlock,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstIfBlock,
  TmplAstRecursiveVisitor,
  TmplAstSwitchBlock,
  TmplAstTemplate,
  TmplAstText,
  parseTemplate,
  tmplAstVisitAll,
} from '@angular/compiler';
import type { TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstNode, TmplAstTextAttribute } from '@angular/compiler';

/** Tipo de ligação "propriedade" em TmplAstBoundAttribute (os outros são attr., class., style. e animação). */
const LIGACAO_DE_PROPRIEDADE = 0;

export interface ResultadoDoTemplate {
  /** Ids dos componentes cujo seletor casa com algum elemento do template. */
  filhos: string[];
  erros: string[];
}

/** Casa elementos do template com seletores de componentes, como o Angular faz. */
export class CasadorDeSeletores {
  private readonly casador = new SelectorMatcher<string>();
  readonly invalidos: { id: string; erro: string }[] = [];

  constructor(componentes: { id: string; seletor: string | null }[]) {
    for (const { id, seletor } of componentes) {
      if (!seletor) {
        continue;
      }
      try {
        this.casador.addSelectables(CssSelector.parse(seletor), id);
      } catch (erro) {
        this.invalidos.push({ id, erro: (erro as Error).message });
      }
    }
  }

  lerTemplate(template: string, arquivo: string): ResultadoDoTemplate {
    const analisado = parseTemplate(template, arquivo, { preserveWhitespaces: false });
    const filhos = new Set<string>();
    const casador = this.casador;

    const casar = (
      nome: string,
      atributos: TmplAstTextAttribute[],
      entradas: TmplAstBoundAttribute[],
      saidas: TmplAstBoundEvent[],
    ): void => {
      const seletor = new CssSelector();
      seletor.setElement(nome);
      for (const atributo of atributos) {
        seletor.addAttribute(atributo.name, atributo.value);
        if (atributo.name.toLowerCase() === 'class') {
          atributo.value.split(/\s+/).filter(Boolean).forEach((classe) => seletor.addClassName(classe));
        }
      }
      for (const entrada of entradas) {
        if (entrada.type === LIGACAO_DE_PROPRIEDADE) {
          seletor.addAttribute(entrada.name, '');
        }
      }
      for (const saida of saidas) {
        seletor.addAttribute(saida.name, '');
      }
      casador.match(seletor, (_, id) => filhos.add(id));
    };

    class Visitante extends TmplAstRecursiveVisitor {
      override visitElement(elemento: TmplAstElement): void {
        casar(elemento.name, elemento.attributes, elemento.inputs, elemento.outputs);
        super.visitElement(elemento);
      }

      override visitTemplate(template: TmplAstTemplate): void {
        // Diretivas estruturais (`*x`) ficam em templateAttrs do <ng-template> sintético.
        const atributos = [...template.attributes, ...template.templateAttrs].filter(
          (a): a is TmplAstTextAttribute => !('type' in a),
        );
        const entradas = [...template.inputs, ...template.templateAttrs].filter(
          (a): a is TmplAstBoundAttribute => 'type' in a,
        );
        casar('ng-template', atributos, entradas, template.outputs);
        super.visitTemplate(template);
      }
    }

    tmplAstVisitAll(new Visitante(), analisado.nodes as TmplAstNode[]);
    return {
      filhos: [...filhos].sort(),
      erros: (analisado.errors ?? []).map((erro) => erro.toString()),
    };
  }
}

// ---------- Tags de tradução no template ----------

/** Um uso do pipe (ou da diretiva) de tradução no template. */
export interface UsoNoTemplate {
  /** null quando a chave não é um texto fixo (chave dinâmica). */
  chave: string | null;
  /** Expressão da chave como está no código. */
  expressao: string;
  papel: string;
  condicao: string | null;
  /** Linha no template, base 0. */
  linha: number;
}

/** Tipo de ligação `attr.x` em TmplAstBoundAttribute. */
const LIGACAO_DE_ATRIBUTO = 1;

/**
 * Encontra as tags de tradução: `'chave' | pipe`, `<el pipe>chave</el>` e `[pipe]="'chave'"`.
 * Uma chave escolhida por ternário entre textos fixos conta como as duas chaves fixas.
 */
export function lerTagsDoTemplate(template: string, arquivo: string, pipe: string): UsoNoTemplate[] {
  const analisado = parseTemplate(template, arquivo, { preserveWhitespaces: false });
  const usos: UsoNoTemplate[] = [];
  const textoDe = (ast: AST): string =>
    ast instanceof ASTWithSource ? (ast.source ?? '') : template.slice(ast.sourceSpan.start, ast.sourceSpan.end);

  const chavesFixas = (ast: AST): string[] | null => {
    if (ast instanceof LiteralPrimitive && typeof ast.value === 'string') return [ast.value];
    if (ast instanceof Conditional) {
      const sim = chavesFixas(ast.trueExp);
      const nao = chavesFixas(ast.falseExp);
      return sim && nao ? [...sim, ...nao] : null;
    }
    return null;
  };

  const registrar = (chaveAst: AST, papel: string, condicao: string | null, linha: number) => {
    const chaves = chavesFixas(chaveAst);
    const expressao = textoDe(chaveAst);
    if (chaves) {
      chaves.forEach((chave) => usos.push({ chave, expressao, papel, condicao, linha }));
    } else {
      usos.push({ chave: null, expressao, papel, condicao, linha });
    }
  };

  /** Todos os usos do pipe dentro de uma expressão (inclusive aninhados). */
  const registrarPipes = (valor: AST, papel: string, condicao: string | null, linha: number) => {
    const pipes: BindingPipe[] = [];
    class Coletor extends RecursiveAstVisitor {
      override visitPipe(ast: BindingPipe, contexto: unknown): unknown {
        if (ast.name === pipe) pipes.push(ast);
        return super.visitPipe(ast, contexto);
      }
    }
    (valor instanceof ASTWithSource ? valor.ast : valor).visit(new Coletor());
    pipes.forEach((p) => registrar(p.exp, papel, condicao, linha));
  };

  const andar = (nos: TmplAstNode[], elemento: string | null, condicao: string | null): void => {
    for (const no of nos) {
      if (no instanceof TmplAstElement) {
        const linha = no.sourceSpan.start.line;
        // Diretiva com a chave no conteúdo: <el translate>chave</el>
        if (no.attributes.some((a) => a.name === pipe)) {
          const chave = no.children.filter((f): f is TmplAstText => f instanceof TmplAstText).map((f) => f.value).join('').trim();
          if (chave) usos.push({ chave, expressao: chave, papel: papelDoTexto(no.name), condicao, linha });
        }
        for (const entrada of no.inputs) {
          if (entrada.name === pipe) {
            // Diretiva com a chave vinculada: [translate]="'chave'"
            const valor = entrada.value instanceof ASTWithSource ? entrada.value.ast : entrada.value;
            registrar(valor, papelDoTexto(no.name), condicao, entrada.sourceSpan.start.line);
          } else {
            registrarPipes(entrada.value, papelDaPropriedade(entrada, no.name), condicao, entrada.sourceSpan.start.line);
          }
        }
        andar(no.children, no.name, condicao);
      } else if (no instanceof TmplAstTemplate) {
        // Diretiva estrutural: *ngIf
        const ngIf = no.templateAttrs.find((a) => a.name === 'ngIf' && 'value' in a && a.value instanceof ASTWithSource);
        const novaCondicao = ngIf ? `aparece quando: \`${textoDe((ngIf as TmplAstBoundAttribute).value)}\`` : condicao;
        for (const entrada of no.inputs) {
          registrarPipes(entrada.value, papelDaPropriedade(entrada, no.tagName ?? 'ng-template'), novaCondicao, entrada.sourceSpan.start.line);
        }
        andar(no.children, elemento, novaCondicao);
      } else if (no instanceof TmplAstBoundText) {
        registrarPipes(no.value, papelDoTexto(elemento), condicao, no.sourceSpan.start.line);
      } else if (no instanceof TmplAstIfBlock) {
        no.branches.forEach((ramo, i) => {
          const anterior = no.branches[i - 1]?.expression;
          const cond = ramo.expression
            ? `aparece quando: \`${textoDe(ramo.expression)}\``
            : `senão de: \`${anterior ? textoDe(anterior) : '?'}\``;
          andar(ramo.children, elemento, cond);
        });
      } else if (no instanceof TmplAstForLoopBlock) {
        andar(no.children, elemento, condicao);
        if (no.empty) andar(no.empty.children, elemento, `lista vazia de: \`${textoDe(no.expression)}\``);
      } else if (no instanceof TmplAstSwitchBlock) {
        const sobre = textoDe(no.expression);
        for (const caso of no.cases) {
          const cond = caso.expression
            ? `aparece quando: \`${sobre} === ${textoDe(caso.expression)}\``
            : `senão de: \`${sobre}\` (nenhum caso)`;
          andar(caso.children, elemento, cond);
        }
      } else if (no instanceof TmplAstDeferredBlock) {
        andar(no.children, elemento, condicao);
        for (const parte of [no.placeholder, no.loading, no.error]) {
          if (parte) andar(parte.children, elemento, condicao);
        }
      } else if ('children' in no && Array.isArray((no as { children: unknown }).children)) {
        andar((no as unknown as { children: TmplAstNode[] }).children, elemento, condicao);
      }
    }
  };

  andar(analisado.nodes as TmplAstNode[], null, null);
  return usos;
}

const TITULOS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

function papelDoTexto(elemento: string | null): string {
  if (!elemento) return 'texto';
  if (elemento === 'button') return 'rótulo do botão';
  if (elemento === 'label') return 'rótulo de campo';
  if (TITULOS.has(elemento)) return 'título';
  if (elemento === 'th') return 'cabeçalho de coluna';
  if (elemento === 'a') return 'link';
  return `texto em ${elemento}`;
}

function papelDaPropriedade(entrada: TmplAstBoundAttribute, elemento: string): string {
  const nome = entrada.name;
  if (nome === 'label' && (elemento === 'p-button' || elemento === 'button')) return 'rótulo do botão';
  if (nome === 'placeholder') return 'placeholder do campo';
  if (nome === 'pTooltip' || nome === 'title') return 'tooltip';
  if (nome === 'header') return elemento === 'th' || elemento === 'p-column' ? 'cabeçalho de coluna' : `título de ${elemento}`;
  if (nome === 'aria-label' || nome === 'ariaLabel' || (entrada.type === LIGACAO_DE_ATRIBUTO && nome === 'aria-label')) return 'rótulo acessível';
  return `propriedade ${nome} de ${elemento}`;
}
