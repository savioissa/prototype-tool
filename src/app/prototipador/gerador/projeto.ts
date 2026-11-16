import { existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { CompilerOptions, Project, SourceFile, ts } from 'ts-morph';

import type { Configuracao } from './configuracao';

/** Pasta do prototipador, relativa à raiz. Nunca é lida, mesmo que esteja dentro de pastaTelas. */
export const PASTA_PROTOTIPADOR = 'src/app/prototipador';

/** Arquivos das telas já carregados no verificador de tipos, prontos para os leitores. */
export interface Telas {
  projeto: Project;
  /** Arquivos sem erro de sintaxe, ordenados pelo caminho. */
  arquivos: SourceFile[];
  /** Arquivos que não puderam ser lidos. */
  avisos: string[];
}

export const posix = (caminho: string) => caminho.split(sep).join('/');

/** Abre `pastaTelas` (e os mocks fora dela) num projeto do ts-morph. Uma vez por geração. */
export function abrirTelas(raiz: string, config: Configuracao, opcoesDoCompilador: CompilerOptions = {}): Telas {
  const projeto = criarProjeto(raiz, opcoesDoCompilador);
  const pastaTelas = resolve(raiz, config.pastaTelas);
  if (!existsSync(pastaTelas)) {
    return { projeto, arquivos: [], avisos: [`pastaTelas "${config.pastaTelas}" não existe.`] };
  }
  projeto.addSourceFilesAtPaths([
    `${posix(pastaTelas)}/**/*.ts`,
    posix(resolve(raiz, config.mocks)),
    `!${posix(pastaTelas)}/**/*.spec.ts`,
    `!${posix(pastaTelas)}/**/*.proto.ts`,
    `!${posix(pastaTelas)}/**/*.d.ts`,
    `!${posix(resolve(raiz, PASTA_PROTOTIPADOR))}/**`,
  ]);

  const programa = projeto.getProgram().compilerObject;
  const avisos: string[] = [];
  const arquivos = [...projeto.getSourceFiles()]
    .sort((a, b) => (a.getFilePath() < b.getFilePath() ? -1 : 1))
    .filter((arquivo) => {
      const erro = programa.getSyntacticDiagnostics(arquivo.compilerNode)[0];
      if (!erro) {
        return true;
      }
      const linha = erro.start === undefined ? '?' : arquivo.getLineAndColumnAtPos(erro.start).line;
      const mensagem = typeof erro.messageText === 'string' ? erro.messageText : erro.messageText.messageText;
      avisos.push(`${posix(relative(raiz, arquivo.getFilePath()))}: erro de sintaxe na linha ${linha} (${mensagem}). Arquivo ignorado.`);
      return false;
    });
  return { projeto, arquivos, avisos };
}

function criarProjeto(raiz: string, opcoesDoCompilador: CompilerOptions): Project {
  const tsconfig = join(raiz, 'tsconfig.json');
  // O TypeScript do ts-morph é mais novo que o do projeto; opções antigas do tsconfig só geram aviso de obsoleto.
  const compilerOptions: CompilerOptions = { ignoreDeprecations: '6.0', noEmit: true, ...opcoesDoCompilador };
  if (existsSync(tsconfig)) {
    return new Project({ tsConfigFilePath: tsconfig, skipAddingFilesFromTsConfig: true, compilerOptions });
  }
  return new Project({
    compilerOptions: { strict: true, experimentalDecorators: true, target: ts.ScriptTarget.ES2022, ...compilerOptions },
  });
}
