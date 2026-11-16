import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import {
  CallExpression,
  ClassDeclaration,
  CompilerOptions,
  Decorator,
  Expression,
  Node,
  ObjectLiteralExpression,
  SourceFile,
  Type,
} from 'ts-morph';

import type { ComponenteRegistrado, InputRegistrado, OutputRegistrado } from '../../modelo/tipos';
import type { Configuracao } from '../configuracao';
import { NAO_LITERAL, textoFixo, valorLiteral } from '../literais';
import { Telas, abrirTelas, posix } from '../projeto';
import { CasadorDeSeletores } from './template';
import { converterTipo } from './tipos-de-campo';

/** Registro de um componente como o gerador o lê; `carregar` e `ajuste` viram código na escrita. */
export interface ComponenteLido extends Omit<ComponenteRegistrado, 'carregar' | 'ajuste'> {
  /** Caminho do `.proto.ts`, relativo à raiz, ou null se não houver. */
  arquivoAjuste: string | null;
}

/** Template de um componente, para quem mais lê os templates (ex.: as tags de tradução). */
export interface TemplateDoComponente {
  id: string;
  texto: string;
  /** Caminho absoluto do .html, ou do .ts quando o template é em linha. */
  arquivo: string;
  /** Linha do arquivo (base 0) onde o template começa: 0 no .html; a linha da crase no template em linha. */
  linhaInicial: number;
}

export interface LeituraDeComponentes {
  componentes: ComponenteLido[];
  templates: TemplateDoComponente[];
  /** Arquivos que não puderam ser lidos e outros problemas fora de um componente. */
  avisos: string[];
}


interface Metadados {
  seletor: string | null;
  standalone: boolean;
  template: { texto: string; arquivo: string; linhaInicial: number } | null;
}

/** Lê os componentes das telas. Recebe as telas já abertas, ou abre (para uso isolado, como nos testes). */
export function lerComponentes(
  raiz: string,
  config: Configuracao,
  opcoesDoCompilador: CompilerOptions = {},
  telas: Telas = abrirTelas(raiz, config, opcoesDoCompilador),
): LeituraDeComponentes {
  const avisos: string[] = [...telas.avisos];
  const pastaTelas = resolve(raiz, config.pastaTelas);

  // 1ª passada: encontrar os componentes e seus metadados.
  const encontrados: { classe: ClassDeclaration; metadados: Metadados; avisos: string[] }[] = [];
  for (const arquivo of telas.arquivos) {
    for (const classe of arquivo.getClasses()) {
      const decorador = classe.getDecorator('Component');
      if (decorador) {
        const avisosDoComponente: string[] = [];
        encontrados.push({ classe, metadados: lerMetadados(decorador, arquivo, avisosDoComponente), avisos: avisosDoComponente });
      }
    }
  }

  const idDe = (e: (typeof encontrados)[number]) => e.metadados.seletor ?? e.classe.getName() ?? '(sem nome)';
  const casador = new CasadorDeSeletores(encontrados.map((e) => ({ id: idDe(e), seletor: e.metadados.seletor })));
  for (const { id, erro } of casador.invalidos) {
    avisos.push(`Seletor inválido em "${id}": ${erro}`);
  }

  // 2ª passada: inputs, outputs e filhos.
  const componentes = encontrados.map(({ classe, metadados, avisos: avisosDoComponente }): ComponenteLido => {
    const arquivo = classe.getSourceFile().getFilePath();
    const nomeDaClasse = classe.getName() ?? '(sem nome)';
    if (!classe.isExported()) {
      avisosDoComponente.push(`A classe ${nomeDaClasse} não é exportada; a área de teste não consegue carregá-la.`);
    }

    let filhos: string[] = [];
    if (metadados.template) {
      try {
        const lido = casador.lerTemplate(metadados.template.texto, metadados.template.arquivo);
        filhos = lido.filhos;
        avisosDoComponente.push(...lido.erros.map((erro) => `Erro no template: ${erro}`));
      } catch (erro) {
        avisosDoComponente.push(`Não foi possível ler o template: ${(erro as Error).message}`);
      }
    }

    const { inputs, outputs } = lerEntradasESaidas(classe, avisosDoComponente);
    const nomeBase = basename(arquivo).replace(/(\.component)?\.ts$/, '');
    const pastaDoArquivo = dirname(arquivo);
    const ajuste = join(pastaDoArquivo, `${nomeBase}.proto.ts`);
    // Na convenção do Angular cada componente tem pasta própria (cartao/cartao.component.ts);
    // nesse caso o grupo é a pasta de cima, para não virar um grupo por componente.
    const pastaDoGrupo = basename(pastaDoArquivo) === nomeBase ? dirname(pastaDoArquivo) : pastaDoArquivo;
    const pasta = posix(relative(pastaTelas, pastaDoGrupo));

    return {
      id: metadados.seletor ?? nomeDaClasse,
      seletor: metadados.seletor,
      classe: nomeDaClasse,
      arquivo: posix(relative(raiz, arquivo)),
      pasta: pasta || '.',
      standalone: metadados.standalone,
      inputs,
      outputs,
      filhos,
      arquivoAjuste: existsSync(ajuste) ? posix(relative(raiz, ajuste)) : null,
      avisos: avisosDoComponente,
    };
  });

  const vistos = new Map<string, string>();
  for (const componente of componentes) {
    const anterior = vistos.get(componente.id);
    if (anterior) {
      avisos.push(`Dois componentes com o id "${componente.id}": ${anterior} e ${componente.arquivo}.`);
    }
    vistos.set(componente.id, componente.arquivo);
  }

  componentes.sort((a, b) => comparar(a.id, b.id) || comparar(a.arquivo, b.arquivo));
  const templates = encontrados
    .filter((e) => e.metadados.template)
    .map((e) => ({ id: idDe(e), ...e.metadados.template! }));
  return { componentes, templates, avisos };
}

// ---------- Metadados do @Component ----------

function lerMetadados(decorador: Decorator, arquivo: SourceFile, avisos: string[]): Metadados {
  const metadados: Metadados = { seletor: null, standalone: false, template: null };
  const argumento = decorador.getArguments()[0];
  if (!Node.isObjectLiteralExpression(argumento)) {
    avisos.push('O metadado do @Component não é um objeto literal; seletor e template não foram lidos.');
    return metadados;
  }

  const seletor = valorDaPropriedade(argumento, 'selector');
  if (seletor) {
    const texto = textoFixo(seletor);
    if (texto === undefined) {
      avisos.push('O seletor não é um texto fixo e não foi lido.');
    } else {
      metadados.seletor = texto.trim() || null;
    }
  }

  // No Angular 17, um componente sem `standalone` não é standalone.
  metadados.standalone = valorDaPropriedade(argumento, 'standalone')?.getKindName() === 'TrueKeyword';

  const template = valorDaPropriedade(argumento, 'template');
  const templateUrl = valorDaPropriedade(argumento, 'templateUrl');
  if (template) {
    const texto = textoFixo(template);
    if (texto === undefined) {
      avisos.push('O template em linha não é um texto fixo e não foi lido; os filhos não foram detectados.');
    } else {
      metadados.template = { texto, arquivo: arquivo.getFilePath(), linhaInicial: template.getStartLineNumber() - 1 };
    }
  } else if (templateUrl) {
    const url = textoFixo(templateUrl);
    const caminho = url === undefined ? undefined : resolve(dirname(arquivo.getFilePath()), url);
    if (caminho && existsSync(caminho)) {
      metadados.template = { texto: readFileSync(caminho, 'utf8'), arquivo: caminho, linhaInicial: 0 };
    } else {
      avisos.push(`O templateUrl "${url ?? templateUrl.getText()}" não foi encontrado; os filhos não foram detectados.`);
    }
  }

  if (valorDaPropriedade(argumento, 'inputs')) {
    avisos.push('Inputs declarados em "inputs: [...]" no metadado não são lidos.');
  }
  if (valorDaPropriedade(argumento, 'hostDirectives')) {
    avisos.push('Inputs vindos de "hostDirectives" não são lidos.');
  }
  return metadados;
}

// ---------- Inputs e outputs ----------

function lerEntradasESaidas(
  classe: ClassDeclaration,
  avisos: string[],
): { inputs: InputRegistrado[]; outputs: OutputRegistrado[] } {
  // Da classe base mais distante até a própria classe; quem vem depois sobrescreve.
  const cadeia: ClassDeclaration[] = [];
  for (let atual: ClassDeclaration | undefined = classe; atual; atual = atual.getBaseClass()) {
    if (atual.getSourceFile().isDeclarationFile()) {
      break;
    }
    cadeia.unshift(atual);
  }

  const inputs = new Map<string, InputRegistrado>();
  const outputs = new Map<string, OutputRegistrado>();

  for (const atual of cadeia) {
    for (const membro of atual.getMembers()) {
      if (Node.isPropertyDeclaration(membro)) {
        const propriedade = membro.getName();
        const decoradorDeInput = membro.getDecorator('Input');
        const decoradorDeOutput = membro.getDecorator('Output');
        const inicial = membro.getInitializer();

        if (decoradorDeInput) {
          const { alias, obrigatorio } = lerDecoradorDeInput(decoradorDeInput);
          const padrao = inicial ? valorLiteral(inicial) : NAO_LITERAL;
          inputs.set(propriedade, montarInput({
            nome: alias ?? propriedade,
            propriedade,
            tipo: membro.getType(),
            local: membro,
            opcional: !obrigatorio || membro.hasQuestionToken(),
            padrao,
            avisos,
          }));
        } else if (decoradorDeOutput) {
          const alias = decoradorDeOutput.getArguments()[0];
          outputs.set(propriedade, { nome: (alias && textoFixo(alias)) ?? propriedade, propriedade });
        } else if (inicial && Node.isCallExpression(inicial)) {
          lerFuncaoDeSinal(inicial, propriedade, membro.getType(), membro, inputs, outputs, avisos);
        }
      } else if (Node.isSetAccessorDeclaration(membro) || Node.isGetAccessorDeclaration(membro)) {
        const decorador = membro.getDecorator('Input');
        if (!decorador) {
          continue;
        }
        const propriedade = membro.getName();
        const { alias, obrigatorio } = lerDecoradorDeInput(decorador);
        const tipo = Node.isSetAccessorDeclaration(membro)
          ? membro.getParameters()[0]?.getType()
          : membro.getReturnType();
        if (!tipo) {
          avisos.push(`O setter do input "${propriedade}" não tem parâmetro.`);
          continue;
        }
        inputs.set(propriedade, montarInput({
          nome: alias ?? propriedade,
          propriedade,
          tipo,
          local: membro,
          opcional: !obrigatorio,
          padrao: NAO_LITERAL,
          avisos,
        }));
      }
    }
  }
  return { inputs: [...inputs.values()], outputs: [...outputs.values()] };
}

/** `input()`, `input.required()`, `model()`, `model.required()` e `output()`. */
function lerFuncaoDeSinal(
  chamada: CallExpression,
  propriedade: string,
  tipoDaPropriedade: Type,
  local: Node,
  inputs: Map<string, InputRegistrado>,
  outputs: Map<string, OutputRegistrado>,
  avisos: string[],
): void {
  const funcao = chamada.getExpression().getText().replace(/\s/g, '');
  const argumentos = chamada.getArguments();
  const obrigatorio = funcao.endsWith('.required');
  const base = funcao.replace(/\.required$/, '');

  if (base === 'output') {
    outputs.set(propriedade, { nome: aliasDasOpcoes(argumentos[0]) ?? propriedade, propriedade });
    return;
  }
  if (base !== 'input' && base !== 'model') {
    return;
  }

  // `required` recebe as opções no 1º argumento; os outros recebem o valor inicial e depois as opções.
  const opcoes = obrigatorio ? argumentos[0] : argumentos[1];
  const nome = aliasDasOpcoes(opcoes) ?? propriedade;
  // InputSignal<T> e ModelSignal<T>: o tipo do valor é o primeiro argumento de tipo.
  const tipo = tipoDaPropriedade.getTypeArguments()[0] ?? tipoDaPropriedade.getAliasTypeArguments()[0];
  if (!tipo) {
    avisos.push(`Não foi possível ler o tipo do input "${nome}".`);
    return;
  }
  inputs.set(propriedade, montarInput({
    nome,
    propriedade,
    tipo,
    local,
    opcional: !obrigatorio,
    padrao: !obrigatorio && argumentos[0] ? valorLiteral(argumentos[0]) : NAO_LITERAL,
    avisos,
  }));
  if (base === 'model') {
    outputs.set(`${propriedade}Change`, { nome: `${nome}Change`, propriedade });
  }
}

function montarInput(dados: {
  nome: string;
  propriedade: string;
  tipo: Type;
  local: Node;
  opcional: boolean;
  padrao: unknown;
  avisos: string[];
}): InputRegistrado {
  const convertido = converterTipo(dados.tipo, dados.local, dados.nome, dados.avisos);
  const input: InputRegistrado = {
    nome: dados.nome,
    propriedade: dados.propriedade,
    tipo: convertido.tipo,
    opcional: dados.opcional || convertido.opcional,
    aceitaNulo: convertido.aceitaNulo,
  };
  if (dados.padrao !== NAO_LITERAL) {
    input.padrao = dados.padrao;
  }
  return input;
}

function lerDecoradorDeInput(decorador: Decorator): { alias: string | null; obrigatorio: boolean } {
  const argumento = decorador.getArguments()[0];
  if (!argumento) {
    return { alias: null, obrigatorio: false };
  }
  if (Node.isObjectLiteralExpression(argumento)) {
    return {
      alias: aliasDasOpcoes(argumento),
      obrigatorio: valorDaPropriedade(argumento, 'required')?.getKindName() === 'TrueKeyword',
    };
  }
  return { alias: textoFixo(argumento) ?? null, obrigatorio: false };
}

// ---------- Utilitários ----------

function aliasDasOpcoes(opcoes: Node | undefined): string | null {
  if (!opcoes || !Node.isObjectLiteralExpression(opcoes)) {
    return null;
  }
  const alias = valorDaPropriedade(opcoes, 'alias');
  return (alias && textoFixo(alias)) ?? null;
}

function valorDaPropriedade(objeto: ObjectLiteralExpression, nome: string): Expression | undefined {
  const propriedade = objeto.getProperty(nome);
  return propriedade && Node.isPropertyAssignment(propriedade) ? propriedade.getInitializer() : undefined;
}

function comparar(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
