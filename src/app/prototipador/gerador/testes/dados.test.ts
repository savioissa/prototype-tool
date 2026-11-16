// Teste 4 de docs/prototipador/05-gerador.md, adaptado: o schema é inferido das telas
// (tipos devolvidos pelos serviços e constantes de dados), sobre o mini-projeto em ./exemplos.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';

import type { Atributo, Relacionamento } from '../../modelo/tipos';
import { lerConfiguracao } from '../configuracao';
import { lerDados } from '../dados/ler-dados';
import { abrirTelas } from '../projeto';

const EXEMPLOS = join(__dirname, 'exemplos');
const configuracao = lerConfiguracao(EXEMPLOS);
const schema = lerDados(EXEMPLOS, configuracao, abrirTelas(EXEMPLOS, configuracao));

function entidade(nome: string) {
  const achada = schema.entidades.find((e) => e.nome === nome);
  assert.ok(achada, `entidade "${nome}" não encontrada`);
  return achada;
}

function atributo(entidadeNome: string, nome: string): Atributo {
  const achado = entidade(entidadeNome).atributos.find((a) => a.nome === nome);
  assert.ok(achado, `atributo "${nome}" não encontrado em "${entidadeNome}"`);
  return achado;
}

function relacionamento(de: string, campo: string): Relacionamento {
  const achado = schema.relacionamentos.find((r) => r.de === de && r.campo === campo);
  assert.ok(achado, `relacionamento ${de}.${campo} não encontrado`);
  return achado;
}

describe('entidades', () => {
  it('vêm dos serviços e das constantes de dados das telas, ordenadas pelo nome', () => {
    assert.deepEqual(
      schema.entidades.map((e) => e.nome),
      ['Cliente', 'Endereco', 'Fornecedores', 'Loja', 'Pedido', 'Produto', 'Produto.categoria', 'Resumo', 'Tag', 'Visita'],
    );
  });

  it('guardam de onde vieram', () => {
    assert.deepEqual(
      entidade('Loja').origens.map((o) => o.exportacao),
      ['DadosService.obterLoja()', 'LOJAS'],
    );
  });

  it('contam os registros das constantes, sem repetir', () => {
    assert.equal(entidade('Loja').registros, 2);
    assert.equal(entidade('Endereco').registros, 3);
    assert.equal(entidade('Resumo').registros, 0);
  });

  it('ignoram tipos de tela, constantes sem tipo com nome e métodos privados', () => {
    const nomes = schema.entidades.map((e) => e.nome);
    assert.ok(!nomes.includes('FiltroDaTela'));
    assert.ok(!nomes.some((n) => /opc/i.test(n)));
  });

  it('mock sem anotação de tipo vira entidade pelo nome do export', () => {
    assert.deepEqual(entidade('Fornecedores').origens, [{ arquivo: 'telas/dados/fornecedores.mock.ts', exportacao: 'FORNECEDORES_MOCK' }]);
  });
});

describe('atributos', () => {
  it('um por campo, com tipo, exemplo e marca', () => {
    assert.deepEqual(atributo('Loja', 'id'), { nome: 'id', tipos: ['numero'], opcional: false, exemplo: '1', marca: 'PK' });
    assert.deepEqual(atributo('Loja', 'nome'), { nome: 'nome', tipos: ['texto'], opcional: false, exemplo: 'Centro', marca: null });
  });

  it('opcional quando falta em algum registro ou é opcional no tipo', () => {
    assert.equal(atributo('Cliente', 'email').opcional, true);
    assert.equal(atributo('Cliente', 'vip').opcional, true);
    assert.equal(atributo('Fornecedores', 'cnpj').opcional, true);
    assert.equal(atributo('Cliente', 'nome').opcional, false);
  });

  it('texto em formato ISO é data', () => {
    assert.deepEqual(atributo('Cliente', 'desde').tipos, ['data']);
  });

  it('sem registros, vale o tipo declarado', () => {
    assert.deepEqual(entidade('Resumo').atributos.map((a) => [a.nome, a.tipos, a.exemplo]), [
      ['total', ['numero'], null],
      ['atualizado', ['booleano'], null],
    ]);
  });

  it('lista de valores simples é atributo marcado como lista', () => {
    assert.equal(atributo('Produto', 'tagIds').lista, true);
  });

  it('chave: id; sem id, codigo com valores únicos', () => {
    assert.equal(atributo('Cliente', 'codigo').marca, 'PK');
    assert.equal(atributo('Tag', 'id').marca, 'PK');
  });

  it('objetos e listas de objetos não são atributos', () => {
    const nomes = entidade('Cliente').atributos.map((a) => a.nome);
    assert.ok(!nomes.includes('endereco') && !nomes.includes('enderecos'));
  });
});

describe('relacionamentos', () => {
  it('aninhado: 1:1 com o tipo do objeto', () => {
    assert.deepEqual(relacionamento('Cliente', 'endereco'), {
      de: 'Cliente', para: 'Endereco', cardinalidade: '1:1', regra: 'aninhado', campo: 'endereco', confianca: 'alta',
    });
  });

  it('lista aninhada: 1:N', () => {
    const r = relacionamento('Cliente', 'enderecos');
    assert.deepEqual([r.para, r.cardinalidade, r.regra], ['Endereco', '1:N', 'listaAninhada']);
  });

  it('objeto sem tipo com nome vira <Pai>.<campo>', () => {
    assert.equal(relacionamento('Produto', 'categoria').para, 'Produto.categoria');
  });

  it('referência <x>Id com todos os valores no destino: N:1 confirmada', () => {
    const r = relacionamento('Produto', 'lojaId');
    assert.deepEqual([r.para, r.cardinalidade, r.regra, r.confianca], ['Loja', 'N:1', 'referencia', 'alta']);
    assert.equal(atributo('Produto', 'lojaId').marca, 'FK');
  });

  it('referência com valor que não existe no destino: provável', () => {
    assert.equal(relacionamento('Pedido', 'lojaId').confianca, 'baixa');
  });

  it('lista de referências <x>Ids: N:N', () => {
    const r = relacionamento('Produto', 'tagIds');
    assert.deepEqual([r.para, r.cardinalidade, r.regra, r.confianca], ['Tag', 'N:N', 'listaDeReferencias', 'alta']);
  });

  it('referência pelos valores: todos existem na chave de outra entidade', () => {
    const r = relacionamento('Pedido', 'clienteCodigo');
    assert.deepEqual([r.para, r.cardinalidade, r.confianca], ['Cliente', 'N:1', 'alta']);
  });

  it('agrupamento: listas guardadas pela chave de outra entidade', () => {
    assert.deepEqual(relacionamento('Cliente', 'VISITAS_POR_CLIENTE'), {
      de: 'Cliente', para: 'Visita', cardinalidade: '1:N', regra: 'agrupamento', campo: 'VISITAS_POR_CLIENTE', confianca: 'alta',
    });
  });
});

describe('avisos', () => {
  it('constante com tipo de entidade que não é feita só de valores fixos', () => {
    assert.deepEqual(schema.avisos, ['telas/dados/dados.ts: LOJAS_CALCULADAS não é feito só de valores fixos; os registros não foram lidos.']);
  });

  it('um arquivo com erro não impede as outras entidades de aparecerem', () => {
    const raiz = mkdtempSync(join(tmpdir(), 'proto-dados-'));
    after(() => rmSync(raiz, { recursive: true, force: true }));
    const arquivos: Record<string, string> = {
      'prototipador.config.json': readFileSync(join(EXEMPLOS, 'prototipador.config.json'), 'utf8'),
      'telas/certo.ts': 'export interface Ponto { x: number }\nexport const PONTOS: Ponto[] = [{ x: 1 }];\n',
      'telas/quebrado.ts': 'export const QUEBRADO = [{ a: 1 ;\n',
    };
    for (const [caminho, conteudo] of Object.entries(arquivos)) {
      mkdirSync(dirname(join(raiz, caminho)), { recursive: true });
      writeFileSync(join(raiz, caminho), conteudo);
    }
    const config = lerConfiguracao(raiz);
    const resultado = lerDados(raiz, config, abrirTelas(raiz, config));
    assert.deepEqual(resultado.entidades.map((e) => e.nome), ['Ponto']);
    assert.match(resultado.avisos[0], /telas\/quebrado\.ts: erro de sintaxe/);
  });
});
