// Monta o texto do diagrama `erDiagram` do Mermaid a partir do schema gerado.
// Sintaxe conferida contra o Mermaid 12.3: apelido `id["nome"]`, comentário entre aspas, `..` tracejado.
import type { Atributo, Relacionamento, SchemaGerado } from '../modelo/tipos';

const PONTAS: Record<Relacionamento['cardinalidade'], [string, string]> = {
  '1:1': ['||', '||'],
  '1:N': ['||', 'o{'],
  'N:1': ['}o', '||'],
  'N:N': ['}o', 'o{'],
};

const ROTULOS: Record<Relacionamento['regra'], (campo: string) => string> = {
  aninhado: (campo) => `aninhado · ${campo}`,
  listaAninhada: (campo) => `lista aninhada · ${campo}`,
  referencia: (campo) => `campo ${campo}`,
  listaDeReferencias: (campo) => `campo ${campo}`,
  agrupamento: (campo) => `agrupado em ${campo}`,
};

/** Nome que o Mermaid aceita como identificador; o nome real vai no apelido. */
function identificador(nome: string): string {
  return nome.replace(/[^A-Za-z0-9_]/g, '_');
}

function semAspas(texto: string): string {
  return texto.replace(/"/g, "'").replace(/[\r\n]+/g, ' ');
}

function linhaDoAtributo(atributo: Atributo): string {
  const tipo = (atributo.tipos.length ? atributo.tipos.join('_ou_') : 'desconhecido') + (atributo.lista ? '[]' : '');
  const comentario = [atributo.opcional ? 'opcional' : null, atributo.exemplo !== null ? `ex.: ${atributo.exemplo}` : null]
    .filter(Boolean)
    .join(' · ');
  return [
    '    ' + tipo,
    identificador(atributo.nome),
    atributo.marca ?? '',
    comentario ? `"${semAspas(comentario)}"` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function textoDoDiagrama(schema: SchemaGerado): string {
  const linhas = ['erDiagram'];
  for (const entidade of schema.entidades) {
    const id = identificador(entidade.nome);
    const cabecalho = id === entidade.nome ? id : `${id}["${semAspas(entidade.nome)}"]`;
    linhas.push(`  ${cabecalho} {`, ...entidade.atributos.map(linhaDoAtributo), '  }');
  }
  for (const relacionamento of schema.relacionamentos) {
    const [esquerda, direita] = PONTAS[relacionamento.cardinalidade];
    // Linha contínua: confirmada pelos dados; tracejada: provável.
    const traco = relacionamento.confianca === 'alta' ? '--' : '..';
    const rotulo = semAspas(ROTULOS[relacionamento.regra](relacionamento.campo));
    linhas.push(
      `  ${identificador(relacionamento.de)} ${esquerda}${traco}${direita} ${identificador(relacionamento.para)} : "${rotulo}"`,
    );
  }
  return linhas.join('\n');
}
