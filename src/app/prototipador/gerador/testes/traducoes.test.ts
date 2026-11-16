// Testes 5 e 6 de docs/prototipador/05-gerador.md: tags de tradução e planilha.
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

import type { TagUsada, UsoDeTag } from '../../modelo/tipos';
import { lerComponentes } from '../componentes/ler-componentes';
import { lerConfiguracao } from '../configuracao';
import { abrirTelas } from '../projeto';
import { lerTags } from '../traducoes/ler-tags';
import { lerPlanilha } from '../traducoes/planilha';

const EXEMPLOS = join(__dirname, 'exemplos');
const configuracao = lerConfiguracao(EXEMPLOS);
const telas = abrirTelas(EXEMPLOS, configuracao);
const resultado = lerTags(EXEMPLOS, configuracao, telas, lerComponentes(EXEMPLOS, configuracao, {}, telas));

function tag(chave: string): TagUsada {
  const achada = resultado.tags.find((t) => t.chave === chave);
  assert.ok(achada, `tag "${chave}" não encontrada`);
  return achada;
}

const uso = (chave: string): UsoDeTag => tag(chave).usos[0];

describe('teste 5: tags no template', () => {
  it('pipe com texto fixo: chave, três textos, componente e contexto', () => {
    const titulo = tag('tela.titulo');
    assert.deepEqual(titulo.textos, { pt: 'Título', en: 'Title', es: 'Título' });
    assert.deepEqual(uso('tela.titulo'), {
      componente: 'ex-textos',
      arquivo: 'telas/traducoes/textos.component.html',
      linha: 1,
      papel: 'título',
      condicao: null,
      trecho: "<h2>{{ 'tela.titulo' | translate }}</h2>",
      provavel: false,
    });
  });

  it('pipe com parâmetros', () => {
    assert.equal(uso('tela.ola').linha, 2);
  });

  it('chaves aninhadas nos arquivos i18n viram caminhos com ponto; texto ausente fica de fora', () => {
    assert.deepEqual(tag('link.ajuda').textos, { pt: 'Ajuda', en: 'Help' });
    assert.deepEqual(tag('codigo.provavel').textos, { pt: 'Código', en: 'Code', es: 'Código' });
  });

  const papeis: [string, string][] = [
    ['acao.salvar', 'rótulo do botão'],
    ['acao.cancelar', 'rótulo do botão'],
    ['campo.nome', 'rótulo de campo'],
    ['tela.titulo', 'título'],
    ['coluna.codigo', 'cabeçalho de coluna'],
    ['link.ajuda', 'link'],
    ['campo.dica', 'placeholder do campo'],
    ['dica.texto', 'tooltip'],
    ['aba.geral', 'título de p-tabPanel'],
    ['acao.fechar', 'rótulo acessível'],
    ['lista.semopcoes', 'propriedade emptyMessage de p-dropdown'],
    ['tela.ola', 'texto em p'],
  ];
  for (const [chave, papel] of papeis) {
    it(`papel: ${papel}`, () => assert.equal(uso(chave).papel, papel));
  }

  it('diretiva: conteúdo e chave vinculada', () => {
    assert.equal(uso('diretiva.conteudo').papel, 'texto em span');
    assert.equal(uso('diretiva.vinculada').papel, 'texto em span');
  });

  const condicoes: [string, string][] = [
    ['lista.vazia', 'aparece quando: `itens.length === 0`'],
    ['lista.cheia', 'senão de: `itens.length === 0`'],
    ['lista.nada', 'lista vazia de: `itens`'],
    ['modo.a', "aparece quando: `modo === 'a'`"],
    ['modo.outro', 'senão de: `modo` (nenhum caso)'],
    ['estrutural.texto', 'aparece quando: `mostrar`'],
  ];
  for (const [chave, condicao] of condicoes) {
    it(`condição: ${condicao}`, () => assert.equal(uso(chave).condicao, condicao));
  }

  it('chave usada em dois componentes: uma tag, dois usos', () => {
    assert.deepEqual(tag('acao.salvar').usos.map((u) => [u.componente, u.arquivo, u.linha]), [
      ['ex-textos', 'telas/traducoes/textos.component.html', 3],
      ['ex-textos-em-linha', 'telas/traducoes/textos-em-linha.component.ts', 8],
    ]);
  });

  it('ternário entre textos fixos conta as duas chaves', () => {
    assert.equal(uso('estado.ativo').linha, 36);
    assert.equal(uso('estado.inativo').linha, 36);
  });

  it('chaves montadas no template vão para as dinâmicas', () => {
    const doTemplate = resultado.dinamicas.filter((d) => d.arquivo.endsWith('.html')).map((d) => d.expressao);
    assert.deepEqual(doTemplate, ["'status.' + estado", 'coluna.header']);
  });
});

describe('teste 5: tags no código', () => {
  it('mensagem de aviso (toast)', () => assert.equal(uso('ts.toast').papel, 'mensagem de aviso (toast) · summary'));
  it('diálogo de confirmação', () => assert.equal(uso('ts.confirmacao').papel, 'diálogo de confirmação · message'));
  it('outra chamada: texto montado no código, com o método', () => assert.equal(uso('ts.montado').papel, 'texto montado no código, em montar()'));
  it('get com lista de chaves e stream', () => {
    assert.equal(uso('ts.lista.a').linha, 39);
    assert.equal(uso('ts.lista.b').linha, 39);
    assert.equal(uso('ts.stream').linha, 40);
  });
  it('chave montada no código vai para as dinâmicas', () => {
    const doCodigo = resultado.dinamicas.find((d) => d.arquivo.endsWith('.ts'));
    assert.deepEqual([doCodigo?.expressao, doCodigo?.papel], ["'ts.' + sufixo", 'texto montado no código, em dinamica()']);
  });
  it('uso provável: texto fixo igual a uma chave dos arquivos i18n', () => {
    assert.deepEqual([uso('codigo.provavel').papel, uso('codigo.provavel').provavel], ['texto no código (uso provável)', true]);
    assert.ok(!resultado.tags.some((t) => t.chave === 'texto qualquer'));
  });
});

describe('teste 6: planilha', () => {
  it('Existente quando a chave está na planilha (sem espaços nas pontas), Nova quando não está', () => {
    assert.equal(resultado.planilhaDisponivel, true);
    assert.equal(tag('acao.salvar').naPlanilha, true);
    assert.equal(tag('acao.cancelar').naPlanilha, true);
    assert.equal(tag('campo.nome').naPlanilha, false);
  });

  const pasta = mkdtempSync(join(tmpdir(), 'proto-planilha-'));
  after(() => rmSync(pasta, { recursive: true, force: true }));
  const arquivo = (nome: string, conteudo: string) => {
    const caminho = join(pasta, nome);
    writeFileSync(caminho, conteudo);
    return caminho;
  };

  it('CSV com vírgula', () => {
    const lida = lerPlanilha(arquivo('virgula.csv', 'Tag,PT\na.b,Um\n"c,d",Dois\n'), 'Tag', 'virgula.csv');
    assert.deepEqual([lida.disponivel, [...lida.chaves]], [true, ['a.b', 'c,d']]);
  });

  it('CSV com ponto e vírgula e marca de ordem de bytes', () => {
    const lida = lerPlanilha(arquivo('ponto.csv', '﻿Chave;Texto\nx.y;Um\nz;Dois\n'), 'Chave', 'ponto.csv');
    assert.deepEqual([lida.disponivel, [...lida.chaves]], [true, ['x.y', 'z']]);
  });

  it('cabeçalho depois de linhas de informação', () => {
    const lida = lerPlanilha(arquivo('info.csv', 'atualizado em,,\n,,\nTag,PT,EN\nk1,a,b\n'), 'Tag', 'info.csv');
    assert.deepEqual([...lida.chaves], ['k1']);
  });

  it('coluna não encontrada: indisponível, com os cabeçalhos no aviso', () => {
    const lida = lerPlanilha(arquivo('sem.csv', 'Chave,PT\na,b\n'), 'Tag', 'sem.csv');
    assert.equal(lida.disponivel, false);
    assert.match(lida.aviso ?? '', /"Tag" não foi encontrada.*Cabeçalhos encontrados: Chave, PT/);
  });

  it('arquivo que não existe', () => {
    const lida = lerPlanilha(join(pasta, 'nao-existe.csv'), 'Tag', 'entrada/tags.csv');
    assert.equal(lida.disponivel, false);
    assert.match(lida.aviso ?? '', /não encontrada em "entrada\/tags\.csv"/);
  });
});
