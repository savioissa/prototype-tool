// Copia a planilha de tags de `planilha.origem` para `planilha.arquivo` (prototipador.config.json).
// Rode a partir da raiz do projeto:  tsx src/app/prototipador/gerador/atualizar-planilha.ts
//
// Roda antes de cada `npm start` e `npm run build`. Nunca interrompe: sem origem configurada,
// origem inexistente ou cópia já atualizada, só imprime uma linha e termina com sucesso.
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { lerConfiguracao } from './configuracao';

const raiz = process.cwd();

try {
  const { planilha } = lerConfiguracao(raiz);
  const destino = resolve(raiz, planilha.arquivo);

  if (!planilha.origem) {
    console.log('[proto] planilha: sem "planilha.origem" no prototipador.config.json; nada a copiar.');
  } else if (!existsSync(planilha.origem)) {
    console.log(`[proto] planilha: "${planilha.origem}" não encontrada nesta máquina; mantida a cópia do projeto.`);
  } else if (existsSync(destino) && statSync(destino).mtimeMs >= statSync(planilha.origem).mtimeMs) {
    console.log('[proto] planilha: cópia do projeto já está atualizada.');
  } else {
    mkdirSync(dirname(destino), { recursive: true });
    copyFileSync(planilha.origem, destino);
    console.log(`[proto] planilha: copiada de "${planilha.origem}".`);
  }
} catch (erro) {
  console.log(`[proto] planilha: não foi possível atualizar (${(erro as Error).message}).`);
}
