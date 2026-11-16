import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import chokidar from 'chokidar';

import { PASTA_PROTOTIPADOR } from './projeto';
import { ARQUIVO_CONFIGURACAO, lerConfiguracao } from './configuracao';

const ESPERA_MS = 300;

/**
 * Vigia telas, i18n, planilha e configuração. Após 300ms sem alterações, roda uma geração
 * completa num processo filho, para que os mocks sejam recarregados do zero.
 */
export function observar(raiz: string, arquivoPrincipal: string): void {
  const configuracao = lerConfiguracao(raiz);
  const alvos = [
    configuracao.pastaTelas,
    configuracao.i18n.pasta,
    configuracao.planilha.arquivo,
    ARQUIVO_CONFIGURACAO,
  ].map((alvo) => resolve(raiz, alvo));

  let espera: NodeJS.Timeout | undefined;
  let rodando = false;
  let pendente = false;

  const rodar = (): void => {
    if (rodando) {
      pendente = true;
      return;
    }
    rodando = true;
    // process.execArgv traz o carregador do tsx, então o filho roda o mesmo main.ts.
    const filho = spawn(process.execPath, [...process.execArgv, arquivoPrincipal], { cwd: raiz, stdio: 'inherit' });
    filho.on('exit', () => {
      rodando = false;
      if (pendente) {
        pendente = false;
        rodar();
      }
    });
  };

  chokidar
    .watch(alvos, {
      ignoreInitial: true,
      ignored: (caminho: string) => resolve(caminho).startsWith(resolve(raiz, PASTA_PROTOTIPADOR)),
    })
    .on('all', () => {
      clearTimeout(espera);
      espera = setTimeout(rodar, ESPERA_MS);
    });

  console.log(`[proto] observando ${alvos.length} caminhos; gera de novo a cada alteração.`);
}
