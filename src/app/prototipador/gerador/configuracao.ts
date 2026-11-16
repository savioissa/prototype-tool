import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Formato do `prototipador.config.json` (ver docs/prototipador/00-visao-geral.md). */
export interface Configuracao {
  pastaTelas: string;
  mocks: string;
  i18n: {
    pasta: string;
    idiomas: Record<string, string>;
  };
  traducao: { pipe: string; servico: string };
  planilha: { arquivo: string; colunaChave: string };
}

export const ARQUIVO_CONFIGURACAO = 'prototipador.config.json';

export function lerConfiguracao(raiz: string): Configuracao {
  const caminho = join(raiz, ARQUIVO_CONFIGURACAO);
  let bruto: unknown;
  try {
    bruto = JSON.parse(readFileSync(caminho, 'utf8'));
  } catch (erro) {
    throw new Error(`Não foi possível ler ${ARQUIVO_CONFIGURACAO}: ${(erro as Error).message}`);
  }
  const config = bruto as Partial<Configuracao>;
  const faltando = (['pastaTelas', 'mocks', 'i18n', 'traducao', 'planilha'] as const).filter(
    (campo) => config[campo] === undefined,
  );
  if (faltando.length) {
    throw new Error(`${ARQUIVO_CONFIGURACAO} sem os campos: ${faltando.join(', ')}`);
  }
  return config as Configuracao;
}
