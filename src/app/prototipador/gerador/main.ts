// Ponto de entrada do gerador. Rode a partir da raiz do projeto:
//   tsx src/app/prototipador/gerador/main.ts             gera uma vez
//   tsx src/app/prototipador/gerador/main.ts --observar  gera a cada alteração
import { gerar, linhaDoResumo } from './gerar';
import { observar } from './observar';

const raiz = process.cwd();

try {
  if (process.argv.includes('--observar')) {
    observar(raiz, process.argv[1]);
  } else {
    console.log(linhaDoResumo(gerar(raiz)));
  }
} catch (erro) {
  console.error(`[proto] ${(erro as Error).message}`);
  process.exitCode = 1;
}
