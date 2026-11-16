import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, sep } from 'node:path';

import type { SchemaGerado, TagsGeradas } from '../modelo/tipos';
import type { ComponenteLido } from './componentes/ler-componentes';

const CABECALHO = '// ARQUIVO GERADO. Não edite.\n';

/** Só reescreve se o conteúdo mudou, para não provocar recarregamentos à toa. Devolve se escreveu. */
export function escreverSeMudou(caminho: string, conteudo: string): boolean {
  if (existsSync(caminho) && readFileSync(caminho, 'utf8') === conteudo) {
    return false;
  }
  mkdirSync(dirname(caminho), { recursive: true });
  writeFileSync(caminho, conteudo);
  return true;
}

/** Caminho de import de `alvo` (absoluto, sem extensão) a partir da pasta `de`. */
function caminhoDeImport(de: string, alvo: string): string {
  const caminho = relative(de, alvo).split(sep).join('/');
  return caminho.startsWith('.') ? caminho : `./${caminho}`;
}

const semExtensao = (caminho: string) => caminho.replace(/\.ts$/, '');

export function textoDosComponentes(
  componentes: ComponenteLido[],
  avisos: string[],
  raiz: string,
  saida: string,
  modelo: string,
): string {
  // As funções `carregar` e `ajuste` entram por marcadores, trocados por código depois do JSON.
  const codigo = new Map<string, string>();
  const dados = componentes.map(({ arquivoAjuste, ...componente }, indice) => {
    const marcadorCarregar = `@@carregar${indice}@@`;
    const marcadorAjuste = `@@ajuste${indice}@@`;
    const arquivo = caminhoDeImport(saida, semExtensao(`${raiz}/${componente.arquivo}`));
    codigo.set(marcadorCarregar, `() => import('${arquivo}').then((m) => m.${componente.classe})`);
    codigo.set(
      marcadorAjuste,
      arquivoAjuste
        ? `() => import('${caminhoDeImport(saida, semExtensao(`${raiz}/${arquivoAjuste}`))}').then((m) => m.default)`
        : 'null',
    );
    return { ...componente, carregar: marcadorCarregar, ajuste: marcadorAjuste };
  });

  let lista = JSON.stringify(dados, null, 2);
  for (const [marcador, trecho] of codigo) {
    lista = lista.replace(`"${marcador}"`, trecho);
  }
  return (
    CABECALHO +
    `import type { ComponenteRegistrado } from '${caminhoDeImport(saida, modelo)}';\n\n` +
    `export const AVISOS_DE_COMPONENTES: string[] = ${JSON.stringify(avisos, null, 2)};\n\n` +
    `export const COMPONENTES: ComponenteRegistrado[] = ${lista};\n`
  );
}

export function textoDoSchema(schema: SchemaGerado, saida: string, modelo: string): string {
  return (
    CABECALHO +
    `import type { SchemaGerado } from '${caminhoDeImport(saida, modelo)}';\n\n` +
    `export const SCHEMA: SchemaGerado = ${JSON.stringify(schema, null, 2)};\n`
  );
}

export function textoDasTags(tags: TagsGeradas, saida: string, modelo: string): string {
  return (
    CABECALHO +
    `import type { TagsGeradas } from '${caminhoDeImport(saida, modelo)}';\n\n` +
    `export const TAGS: TagsGeradas = ${JSON.stringify(tags, null, 2)};\n`
  );
}
