import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';

export interface LeituraDaPlanilha {
  disponivel: boolean;
  chaves: Set<string>;
  aviso: string | null;
}

/**
 * Lê as chaves da planilha de tags (CSV). Detecta o separador (`,` ou `;`) e ignora a marca de
 * ordem de bytes. O cabeçalho é a primeira linha que tem a coluna `colunaChave` (a planilha do
 * produto traz linhas de informação antes dele).
 */
export function lerPlanilha(caminho: string, colunaChave: string, nomeNaConfiguracao: string): LeituraDaPlanilha {
  const indisponivel = (aviso: string): LeituraDaPlanilha => ({ disponivel: false, chaves: new Set(), aviso });
  if (!existsSync(caminho)) {
    return indisponivel(`Planilha de tags não encontrada em "${nomeNaConfiguracao}". Exporte o CSV para esse caminho (planilha.arquivo no prototipador.config.json).`);
  }
  const texto = readFileSync(caminho, 'utf8').replace(/^﻿/, '');
  const coluna = colunaChave.trim();
  let primeiraLinha: string[] = [];

  for (const separador of [',', ';']) {
    let linhas: string[][];
    try {
      linhas = parse(texto, { delimiter: separador, relax_column_count: true, relax_quotes: true, skip_empty_lines: true });
    } catch {
      continue;
    }
    if (!primeiraLinha.length) {
      primeiraLinha = linhas.find((linha) => linha.some((celula) => celula.trim())) ?? [];
    }
    if (!coluna) {
      break;
    }
    const cabecalho = linhas.findIndex((linha) => linha.some((celula) => celula.trim() === coluna));
    if (cabecalho >= 0) {
      const indice = linhas[cabecalho].findIndex((celula) => celula.trim() === coluna);
      const chaves = new Set(linhas.slice(cabecalho + 1).map((linha) => (linha[indice] ?? '').trim()).filter(Boolean));
      return { disponivel: true, chaves, aviso: null };
    }
  }

  const encontrados = primeiraLinha.map((celula) => celula.trim()).filter(Boolean).join(', ') || '(nenhum)';
  return indisponivel(
    coluna
      ? `A coluna "${coluna}" não foi encontrada na planilha. Cabeçalhos encontrados: ${encontrados}. Ajuste planilha.colunaChave no prototipador.config.json.`
      : `planilha.colunaChave não está configurada no prototipador.config.json. Cabeçalhos encontrados: ${encontrados}.`,
  );
}
