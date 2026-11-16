// Testes 1, 2 e 3 de docs/prototipador/05-gerador.md, sobre o mini-projeto em ./exemplos.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import type { InputRegistrado, TipoCampo } from '../../modelo/tipos';
import { lerComponentes } from '../componentes/ler-componentes';
import { lerConfiguracao } from '../configuracao';

const EXEMPLOS = join(__dirname, 'exemplos');
const { componentes, avisos } = lerComponentes(EXEMPLOS, lerConfiguracao(EXEMPLOS));

function componente(id: string) {
  const achado = componentes.find((c) => c.id === id);
  assert.ok(achado, `componente "${id}" não encontrado`);
  return achado;
}

function entrada(id: string, nome: string): InputRegistrado {
  const achado = componente(id).inputs.find((i) => i.nome === nome);
  assert.ok(achado, `input "${nome}" não encontrado em "${id}"`);
  return achado;
}

const tipo = (nome: string): TipoCampo => entrada('ex-tipos', nome).tipo;

describe('registro', () => {
  it('lê todos os componentes, ordenados pelo id, sem avisos gerais', () => {
    assert.deepEqual(avisos, []);
    assert.deepEqual(
      componentes.map((c) => c.id),
      [
        'MetadadoComponent',
        'SemSeletorComponent',
        '[exFilhoAtributo]',
        'ex-entradas',
        'ex-filho-a',
        'ex-filho-b',
        'ex-filho-nao-usado',
        'ex-pai-em-arquivo',
        'ex-pai-em-linha',
        'ex-textos',
        'ex-textos-em-linha',
        'ex-tipos',
      ],
    );
  });

  it('preenche identificação e standalone', () => {
    const c = componente('ex-entradas');
    assert.equal(c.seletor, 'ex-entradas');
    assert.equal(c.classe, 'EntradasComponent');
    assert.equal(c.arquivo, 'telas/entradas/entradas.component.ts');
    assert.equal(c.standalone, true);
  });

  it('usa o nome da classe como id quando não há seletor', () => {
    const c = componente('SemSeletorComponent');
    assert.equal(c.seletor, null);
  });

  it('liga o arquivo de ajuste pelo nome', () => {
    assert.equal(componente('ex-filho-a').arquivoAjuste, 'telas/filhos/filho-a.proto.ts');
    assert.equal(componente('ex-filho-b').arquivoAjuste, null);
  });
});

describe('teste 1: formas de input e output', () => {
  const casos: [nome: string, propriedade: string, opcional: boolean, padrao?: unknown][] = [
    ['simples', 'simples', true, 'a'],
    ['apelido', 'comAlias', true, 0],
    ['apelidoObjeto', 'comAliasObjeto', true, false],
    ['obrigatorio', 'obrigatorio', false],
    ['comSetter', 'comSetter', true],
    ['sinal', 'sinal', true],
    ['sinalComValor', 'sinalComValor', true, 10],
    ['sinalApelido', 'sinalComAlias', true, 'x'],
    ['sinalObrigatorio', 'sinalObrigatorio', false],
    ['obrigatorioApelido', 'sinalObrigatorioComAlias', false],
    ['modelo', 'modelo', true, 'm'],
  ];
  for (const [nome, propriedade, opcional, padrao] of casos) {
    it(`input "${nome}"`, () => {
      const i = entrada('ex-entradas', nome);
      assert.equal(i.propriedade, propriedade);
      assert.equal(i.opcional, opcional);
      if (padrao === undefined) {
        assert.ok(!('padrao' in i), 'não deveria ter padrao');
      } else {
        assert.deepEqual(i.padrao, padrao);
      }
    });
  }

  it('lê os tipos de setter e de signal', () => {
    assert.deepEqual(entrada('ex-entradas', 'comSetter').tipo, { tipo: 'numero' });
    assert.deepEqual(entrada('ex-entradas', 'sinal').tipo, { tipo: 'texto' });
    assert.deepEqual(entrada('ex-entradas', 'sinalObrigatorio').tipo, { tipo: 'booleano' });
  });

  it('herda inputs da classe base e deixa a classe sobrescrever', () => {
    const herdado = entrada('ex-entradas', 'herdado');
    assert.equal(herdado.aceitaNulo, true);
    assert.equal(herdado.padrao, null);
    assert.equal(entrada('ex-entradas', 'sobrescrito').padrao, 'da classe');
  });

  it('só registra padrão para valores literais', () => {
    assert.deepEqual(entrada('ex-entradas', 'lista').padrao, [1, 2]);
    assert.deepEqual(entrada('ex-entradas', 'objeto').padrao, { nome: 'x', ativo: true });
    assert.ok(!('padrao' in entrada('ex-entradas', 'calculado')));
  });

  it('lê outputs com e sem alias, output() e o xChange do model()', () => {
    assert.deepEqual(componente('ex-entradas').outputs, [
      { nome: 'modeloChange', propriedade: 'modelo' },
      { nome: 'clicou', propriedade: 'clicou' },
      { nome: 'apelidoSaida', propriedade: 'saiu' },
      { nome: 'mudou', propriedade: 'mudou' },
      { nome: 'mudouApelido', propriedade: 'mudouComAlias' },
    ]);
  });

  it('avisa sobre inputs no metadado e em hostDirectives', () => {
    const c = componente('MetadadoComponent');
    assert.equal(c.inputs.length, 0);
    assert.equal(c.avisos.length, 2);
    assert.match(c.avisos[0], /inputs: \[\.\.\.\]/);
    assert.match(c.avisos[1], /hostDirectives/);
  });
});

describe('teste 2: tipos', () => {
  const editaveis: [string, TipoCampo][] = [
    ['texto', { tipo: 'texto' }],
    ['numero', { tipo: 'numero' }],
    ['booleano', { tipo: 'booleano' }],
    ['data', { tipo: 'data' }],
    ['opcoesTexto', { tipo: 'opcoes', valores: ['a', 'b'] }],
    ['opcoesNumero', { tipo: 'opcoes', valores: [1, 2] }],
    ['opcoesApelido', { tipo: 'opcoes', valores: ['p', 'q'] }],
    ['enumTexto', { tipo: 'opcoes', valores: ['azul', 'verde'] }],
    ['enumNumero', { tipo: 'opcoes', valores: [0, 1] }],
    ['lista', { tipo: 'lista', item: { tipo: 'texto' } }],
    ['listaGenerica', { tipo: 'lista', item: { tipo: 'numero' } }],
    ['listaSomenteLeitura', { tipo: 'lista', item: { tipo: 'texto' } }],
    ['literal', { tipo: 'objeto', campos: [{ nome: 'x', tipo: { tipo: 'numero' }, opcional: false, aceitaNulo: false }] }],
  ];
  for (const [nome, esperado] of editaveis) {
    it(nome, () => assert.deepEqual(tipo(nome), esperado));
  }

  it('interface, com campo opcional e campo que aceita nulo', () => {
    assert.deepEqual(tipo('interface'), {
      tipo: 'objeto',
      campos: [
        { nome: 'rua', tipo: { tipo: 'texto' }, opcional: false, aceitaNulo: false },
        { nome: 'numero', tipo: { tipo: 'numero' }, opcional: true, aceitaNulo: false },
        { nome: 'complemento', tipo: { tipo: 'texto' }, opcional: false, aceitaNulo: true },
      ],
    });
  });

  it('classe só com propriedades de dado', () => {
    const t = tipo('classeDeDados');
    assert.equal(t.tipo, 'objeto');
    assert.deepEqual(t.tipo === 'objeto' && t.campos.map((c) => c.nome), ['x', 'y']);
  });

  it('T | null e T | undefined', () => {
    assert.deepEqual([tipo('nulo'), entrada('ex-tipos', 'nulo').aceitaNulo], [{ tipo: 'texto' }, true]);
    assert.deepEqual([tipo('indefinido'), entrada('ex-tipos', 'indefinido').opcional], [{ tipo: 'texto' }, true]);
    assert.deepEqual([tipo('interrogacao'), entrada('ex-tipos', 'interrogacao').opcional], [{ tipo: 'numero' }, true]);
  });

  const naoEditaveis: [string, string][] = [
    ['funcao', 'função'],
    ['template', 'TemplateRef'],
    ['observavel', 'Observable'],
    ['sinal', 'signal'],
    ['qualquer', 'any'],
    ['desconhecido', 'unknown'],
    ['generico', 'parâmetro genérico'],
    ['uniaoMista', 'união de tipos diferentes'],
    ['classeComMetodo', 'objeto com métodos'],
    ['dicionario', 'dicionário com chaves livres'],
  ];
  for (const [nome, motivo] of naoEditaveis) {
    it(`${nome} não é editável (${motivo})`, () => {
      const t = tipo(nome);
      assert.equal(t.tipo, 'naoEditavel');
      assert.equal(t.tipo === 'naoEditavel' && t.motivo, motivo);
    });
  }

  it('tipo que se refere a si mesmo para no ponto da repetição', () => {
    const t = tipo('autoReferente');
    assert.equal(t.tipo, 'objeto');
    const filhos = t.tipo === 'objeto' ? t.campos.find((c) => c.nome === 'filhos')?.tipo : undefined;
    assert.deepEqual(filhos?.tipo === 'lista' && filhos.item.tipo === 'naoEditavel' && filhos.item.motivo, 'tipo que se refere a si mesmo');
  });

  it('aninhamento além de 5 níveis', () => {
    let atual: TipoCampo | undefined = tipo('profundo');
    for (const nivel of ['n2', 'n3', 'n4', 'n5']) {
      assert.equal(atual?.tipo, 'objeto', `nível ${nivel}`);
      atual = atual?.tipo === 'objeto' ? atual.campos.find((c) => c.nome === nivel)?.tipo : undefined;
    }
    const sexto = atual?.tipo === 'objeto' ? atual.campos[0].tipo : undefined;
    assert.equal(sexto?.tipo === 'naoEditavel' && sexto.motivo, 'aninhamento além de 5 níveis');
  });

  it('cada não editável gera um aviso no componente', () => {
    assert.equal(componente('ex-tipos').avisos.length, naoEditaveis.length + 2);
    assert.ok(componente('ex-tipos').avisos.includes('Input "funcao" não é editável: função (tipo () => void).'));
  });
});

describe('teste 3: filhos', () => {
  it('template em linha, com filho dentro de @if', () => {
    assert.deepEqual(componente('ex-pai-em-linha').filhos, ['ex-filho-a', 'ex-filho-b']);
  });

  it('template em arquivo, com @for, @defer, *ngIf e seletor de atributo', () => {
    assert.deepEqual(componente('ex-pai-em-arquivo').filhos, ['[exFilhoAtributo]', 'ex-filho-a', 'ex-filho-b']);
  });

  it('componente sem seletor também tem filhos', () => {
    assert.deepEqual(componente('SemSeletorComponent').filhos, ['ex-filho-a']);
  });

  it('componente sem filhos', () => {
    assert.deepEqual(componente('ex-filho-nao-usado').filhos, []);
  });
});

describe('pasta', () => {
  it('usa a pasta de cima quando o componente tem pasta própria com o mesmo nome', () => {
    // telas/entradas/entradas.component.ts e telas/tipos/tipos.component.ts ficam na raiz das telas.
    assert.equal(componente('ex-entradas').pasta, '.');
    assert.equal(componente('ex-tipos').pasta, '.');
    // telas/filhos/filho-a.component.ts: a pasta tem outro nome, então vale ela mesma.
    assert.equal(componente('ex-filho-a').pasta, 'filhos');
  });
});
