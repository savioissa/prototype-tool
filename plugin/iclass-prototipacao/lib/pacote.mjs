// Leitura e extração dos pacotes do plugin (pacotes/*.json).
//
// Um pacote é um JSON com a lista de arquivos (caminho relativo à raiz do projeto, codificação e
// conteúdo). Ele existe por dois motivos: caminhos profundos de pastas dentro do plugin estouram o
// limite de 260 caracteres do Windows, e um único arquivo é fácil de versionar e conferir.
// Os pacotes são produzidos por `npm run plugin:empacotar` no repositório do prototype-tool.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export function lerPacote(caminho) {
  if (!existsSync(caminho)) {
    throw new Error(`Pacote não encontrado: ${caminho}. Rode "npm run plugin:empacotar" no prototype-tool.`);
  }
  const pacote = JSON.parse(readFileSync(caminho, 'utf8'));
  if (pacote.formato !== 1 || !Array.isArray(pacote.arquivos)) {
    throw new Error(`Pacote em formato desconhecido: ${caminho}`);
  }
  return pacote;
}

function aplicarSubstituicoes(texto, substituicoes) {
  return Object.entries(substituicoes).reduce((atual, [de, para]) => atual.split(de).join(para), texto);
}

function mesclarLinhas(existente, novo) {
  const presentes = new Set(existente.split(/\r?\n/).map((linha) => linha.trim()));
  const faltando = novo.split(/\r?\n/).filter((linha) => linha.trim() && !presentes.has(linha.trim()));
  if (!faltando.length) {
    return null;
  }
  const separador = existente.endsWith('\n') ? '' : '\n';
  return `${existente}${separador}\n${faltando.join('\n')}\n`;
}

/**
 * Escreve os arquivos do pacote em `destino`.
 * - Nunca sobrescreve: se algum arquivo já existe e não está em `regras`, nada é escrito.
 * - `regras[caminho]`: 'manter' (deixa o existente) ou 'mesclarLinhas' (acrescenta linhas que faltam).
 * - `substituicoes` vale só para arquivos de texto.
 */
export function extrair(pacote, destino, { substituicoes = {}, regras = {} } = {}) {
  const conflitos = pacote.arquivos
    .filter(({ caminho }) => existsSync(join(destino, caminho)) && !regras[caminho])
    .map(({ caminho }) => caminho);
  if (conflitos.length) {
    return { ok: false, conflitos, criados: [], mantidos: [], mesclados: [] };
  }

  const resultado = { ok: true, conflitos: [], criados: [], mantidos: [], mesclados: [] };
  for (const { caminho, codificacao, conteudo } of pacote.arquivos) {
    const alvo = join(destino, caminho);
    const dados =
      codificacao === 'base64' ? Buffer.from(conteudo, 'base64') : aplicarSubstituicoes(conteudo, substituicoes);

    if (existsSync(alvo)) {
      if (regras[caminho] === 'mesclarLinhas' && typeof dados === 'string') {
        const mesclado = mesclarLinhas(readFileSync(alvo, 'utf8'), dados);
        if (mesclado) {
          writeFileSync(alvo, mesclado);
          resultado.mesclados.push(caminho);
          continue;
        }
      }
      resultado.mantidos.push(caminho);
      continue;
    }
    mkdirSync(dirname(alvo), { recursive: true });
    writeFileSync(alvo, dados);
    resultado.criados.push(caminho);
  }
  return resultado;
}
