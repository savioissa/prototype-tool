// Teste 7 de docs/prototipador/05-gerador.md, mais a escrita estável e o código gerado.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import { ts } from 'ts-morph';

import { gerar } from '../gerar';

const temporarias: string[] = [];
after(() => temporarias.forEach((pasta) => rmSync(pasta, { recursive: true, force: true })));

function projetoTemporario(arquivos: Record<string, string>): string {
  const raiz = mkdtempSync(join(tmpdir(), 'proto-gerador-'));
  temporarias.push(raiz);
  for (const [caminho, conteudo] of Object.entries(arquivos)) {
    mkdirSync(dirname(join(raiz, caminho)), { recursive: true });
    writeFileSync(join(raiz, caminho), conteudo);
  }
  return raiz;
}

const CONFIGURACAO = readFileSync(join(__dirname, 'exemplos', 'prototipador.config.json'), 'utf8');

const erroDeSintaxe = (texto: string) =>
  ts.transpileModule(texto, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022 } }).diagnostics ?? [];

describe('teste 7: arquivo com erro de sintaxe', () => {
  const raiz = projetoTemporario({
    'prototipador.config.json': CONFIGURACAO,
    'telas/certo.component.ts': `
      import { Component, Input } from '@angular/core';
      @Component({ selector: 'ex-certo', standalone: true, template: '' })
      export class CertoComponent { @Input() valor = 1; }
    `,
    'telas/quebrado.component.ts': `
      import { Component } from '@angular/core';
      @Component({ selector: 'ex-quebrado', template: '' })
      export class QuebradoComponent {
        metodo( {
    `,
  });
  const saida = join(raiz, 'gerado');
  const resumo = gerar(raiz, { saida });
  const texto = readFileSync(join(saida, 'componentes.gerado.ts'), 'utf8');

  it('a geração termina e lê os outros arquivos', () => {
    assert.equal(resumo.componentes, 1);
    assert.match(texto, /"id": "ex-certo"/);
  });

  it('o aviso aparece no arquivo gerado, com o caminho', () => {
    // 1 erro de sintaxe + 3 arquivos i18n e a planilha, que o projeto temporário não tem.
    assert.equal(resumo.avisos, 5);
    assert.match(texto, /telas\/quebrado\.component\.ts: erro de sintaxe na linha \d+/);
  });

  it('escreve os três arquivos, com cabeçalho', () => {
    for (const arquivo of ['componentes.gerado.ts', 'schema.gerado.ts', 'tags.gerado.ts']) {
      assert.ok(readFileSync(join(saida, arquivo), 'utf8').startsWith('// ARQUIVO GERADO. Não edite.\n'), arquivo);
    }
  });
});

describe('saída', () => {
  const raiz = join(__dirname, 'exemplos');
  const saida = mkdtempSync(join(tmpdir(), 'proto-saida-'));
  temporarias.push(saida);
  const primeira = gerar(raiz, { saida });
  const segunda = gerar(raiz, { saida });
  const texto = readFileSync(join(saida, 'componentes.gerado.ts'), 'utf8');

  it('é estável: a segunda geração não reescreve nada', () => {
    assert.equal(primeira.alterados.length, 3);
    assert.deepEqual(segunda.alterados, []);
  });

  it('gera código TypeScript válido', () => {
    for (const arquivo of ['componentes.gerado.ts', 'schema.gerado.ts', 'tags.gerado.ts']) {
      assert.deepEqual(erroDeSintaxe(readFileSync(join(saida, arquivo), 'utf8')), [], arquivo);
    }
  });

  it('carregar importa a classe do componente', () => {
    assert.match(texto, /"carregar": \(\) => import\('[^']*\/telas\/entradas\/entradas\.component'\)\.then\(\(m\) => m\.EntradasComponent\)/);
  });

  it('ajuste importa o export default do .proto.ts, ou é null', () => {
    assert.match(texto, /"ajuste": \(\) => import\('[^']*\/telas\/filhos\/filho-a\.proto'\)\.then\(\(m\) => m\.default\)/);
    assert.match(texto, /"ajuste": null/);
  });
});
