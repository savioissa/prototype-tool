// Gera os pacotes do plugin iclass-prototipacao a partir deste repositório.
//   npm run plugin:empacotar      (na raiz do prototype-tool)
//
// - preparar-angular/pacotes/esqueleto.json:      plugin/esqueleto + parser posicional, favicon e .vscode da raiz
// - instalar-prototipador/pacotes/prototipador.json: src/app/prototipador (sem gerado/ e sem CSV) + docs
//
// O prototype-tool é a fonte da verdade: altere o código aqui, rode este script e faça o commit
// dos pacotes junto. Os pacotes só são reescritos quando o conteúdo muda.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const pastaPlugin = dirname(fileURLToPath(import.meta.url));
const raiz = dirname(pastaPlugin);
const plugin = join(pastaPlugin, 'iclass-prototipacao');
const versaoPlugin = JSON.parse(readFileSync(join(plugin, '.claude-plugin', 'plugin.json'), 'utf8')).version;

const BINARIOS = new Set(['.ico', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.woff', '.woff2', '.ttf']);
const posix = (caminho) => caminho.split(sep).join('/');

function commit() {
  try {
    const hash = execSync('git rev-parse --short HEAD', { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const sujo = execSync('git status --porcelain -- src/app/prototipador docs/prototipador plugin/esqueleto', {
      cwd: raiz,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return sujo ? `${hash}+alterações` : hash;
  } catch {
    return null;
  }
}

/** Lista arquivos de `pasta`, recursivamente, pulando o que `ignorar` disser. */
function listar(pasta, ignorar = () => false) {
  if (!existsSync(pasta)) {
    return [];
  }
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (ignorar(caminho)) {
      return [];
    }
    return statSync(caminho).isDirectory() ? listar(caminho, ignorar) : [caminho];
  });
}

/** Lê um arquivo para o pacote. `destino` é o caminho dele no projeto novo. */
function entrada(arquivo, destino) {
  if (BINARIOS.has(extname(arquivo).toLowerCase())) {
    return { caminho: destino, codificacao: 'base64', conteudo: readFileSync(arquivo).toString('base64') };
  }
  // Fim de linha LF: o pacote fica igual em qualquer máquina
  return { caminho: destino, codificacao: 'utf8', conteudo: readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n') };
}

function escreverPacote(destino, nome, arquivos) {
  arquivos.sort((a, b) => (a.caminho < b.caminho ? -1 : 1));
  const texto = `${JSON.stringify({ formato: 1, nome, versaoPlugin, commit: commit(), arquivos }, null, 1)}\n`;
  const anterior = existsSync(destino) ? readFileSync(destino, 'utf8') : null;
  const semCommit = (t) => t?.replace(/"commit": [^\n]*\n/, '');
  if (semCommit(anterior) === semCommit(texto)) {
    console.log(`[plugin] ${nome}: sem alterações (${arquivos.length} arquivos)`);
    return;
  }
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, texto);
  console.log(`[plugin] ${nome}: ${arquivos.length} arquivos → ${posix(relative(raiz, destino))}`);
}

// ---------- esqueleto ----------
const pastaEsqueleto = join(pastaPlugin, 'esqueleto');
const esqueleto = listar(pastaEsqueleto, (caminho) => /[\\/]node_modules$/.test(caminho)).map((arquivo) =>
  entrada(arquivo, posix(relative(pastaEsqueleto, arquivo))),
);
esqueleto.push(entrada(join(raiz, 'src', 'app', 'traducao', 'parser-posicional.ts'), 'src/app/traducao/parser-posicional.ts'));
esqueleto.push(entrada(join(raiz, 'src', 'favicon.ico'), 'src/favicon.ico'));
// .vscode/ vem da raiz do prototype-tool (pastas .vscode não podem ficar dentro do plugin)
for (const arquivo of listar(join(raiz, '.vscode'))) {
  esqueleto.push(entrada(arquivo, posix(relative(raiz, arquivo))));
}
escreverPacote(join(plugin, 'skills', 'preparar-angular', 'pacotes', 'esqueleto.json'), 'esqueleto', esqueleto);

// ---------- prototipador ----------
const pastaPrototipador = join(raiz, 'src', 'app', 'prototipador');
const ignorarNoPrototipador = (caminho) => {
  const relativo = posix(relative(pastaPrototipador, caminho));
  return relativo === 'gerado' || (relativo.startsWith('entrada/') && relativo.endsWith('.csv'));
};
const prototipador = listar(pastaPrototipador, ignorarNoPrototipador).map((arquivo) =>
  entrada(arquivo, posix(relative(raiz, arquivo))),
);
// A pasta entrada/ precisa existir no projeto novo, mesmo sem planilha
if (!prototipador.some(({ caminho }) => caminho.startsWith('src/app/prototipador/entrada/'))) {
  prototipador.push({ caminho: 'src/app/prototipador/entrada/.gitkeep', codificacao: 'utf8', conteudo: '' });
}

// Especificação: 00 a 05. O 06 é o plano de construção da ferramenta e não serve ao projeto novo.
const pastaDocs = join(raiz, 'docs', 'prototipador');
for (const arquivo of listar(pastaDocs).filter((caminho) => !/06-plano-de-construcao\.md$/.test(caminho))) {
  prototipador.push(entrada(arquivo, posix(relative(raiz, arquivo))));
}
escreverPacote(join(plugin, 'skills', 'instalar-prototipador', 'pacotes', 'prototipador.json'), 'prototipador', prototipador);

if (!prototipador.some(({ caminho }) => caminho.includes('/testes/exemplos/telas/'))) {
  console.warn('[plugin] aviso: o pacote do prototipador está sem os exemplos dos testes do gerador.');
}
