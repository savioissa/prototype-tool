// Confere a instalação do prototipador. Imprime JSON; sai com código 1 se alguma checagem falhar.
//   node validar.mjs "<pasta do projeto>" [--sem-build]
//
// Checagens: arquivos e pontos de contato, isolamento das telas, gerador (proto:gerar),
// testes do gerador (proto:testar) e build do Angular em modo desenvolvimento.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const pasta = resolve(args.find((arg) => !arg.startsWith('--')) ?? '.');
const semBuild = args.includes('--sem-build');
const checagens = [];
const registrar = (nome, ok, detalhe = null) => checagens.push({ nome, ok, detalhe });
const ler = (arquivo) => (existsSync(join(pasta, arquivo)) ? readFileSync(join(pasta, arquivo), 'utf8') : '');
const posix = (caminho) => caminho.split(sep).join('/');

function rodar(nome, comando) {
  const inicio = Date.now();
  const resultado = spawnSync(comando, { cwd: pasta, shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const saida = `${resultado.stdout ?? ''}${resultado.stderr ?? ''}`.trim().split(/\r?\n/);
  registrar(nome, resultado.status === 0, {
    comando,
    segundos: Math.round((Date.now() - inicio) / 1000),
    // Final da saída: onde costumam estar o resumo e o erro
    saida: saida.slice(-25).join('\n'),
  });
}

// ---------- Arquivos e pontos de contato ----------
let config = null;
try {
  config = JSON.parse(ler('prototipador.config.json'));
  registrar('prototipador.config.json', true);
} catch (erro) {
  registrar('prototipador.config.json', false, (erro).message);
}
registrar('pasta src/app/prototipador', existsSync(join(pasta, 'src', 'app', 'prototipador', 'rotas.ts')));
registrar('node_modules instalado', existsSync(join(pasta, 'node_modules', 'ts-morph')), 'Se falhou: rode npm install.');
registrar('app.routes.ts usa comPrototipador', /comPrototipador\(/.test(ler('src/app/app.routes.ts')));
registrar('app.config.ts usa comExibirTags', /comExibirTags\(/.test(ler('src/app/app.config.ts')));
const scripts = JSON.parse(ler('package.json') || '{}').scripts ?? {};
registrar(
  'scripts do package.json',
  ['proto:gerar', 'proto:observar', 'proto:planilha', 'proto:testar'].every((nome) => scripts[nome]) &&
    /proto:observar/.test(scripts.start ?? ''),
  { start: scripts.start ?? null, prestart: scripts.prestart ?? null },
);
registrar('.gitignore ignora gerado/', ler('.gitignore').includes('/src/app/prototipador/gerado/'));

// ---------- Isolamento: telas só importam o prototipador em *.proto.ts ----------
function listarTs(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? listarTs(caminho) : caminho.endsWith('.ts') ? [caminho] : [];
  });
}
const pastaTelas = join(pasta, config?.pastaTelas ?? 'src/app/telas');
const violacoes = listarTs(pastaTelas)
  .filter((arquivo) => !arquivo.endsWith('.proto.ts'))
  .filter((arquivo) => /from\s+['"][^'"]*prototipador[^'"]*['"]/.test(readFileSync(arquivo, 'utf8')))
  .map((arquivo) => posix(relative(pasta, arquivo)));
registrar('telas não importam o prototipador', violacoes.length === 0, violacoes.length ? violacoes : null);

// ---------- Comandos ----------
if (checagens.every((checagem) => checagem.ok || checagem.nome === 'telas não importam o prototipador')) {
  rodar('gerador (proto:gerar)', 'npm run proto:gerar');
  rodar('testes do gerador (proto:testar)', 'npm run proto:testar');
  if (!semBuild) {
    rodar('build do Angular (desenvolvimento)', 'npx ng build --configuration development');
  }
} else {
  registrar('comandos', false, 'Não rodados: corrija as checagens acima primeiro.');
}

const ok = checagens.every((checagem) => checagem.ok);
console.log(JSON.stringify({ pasta, ok, checagens }, null, 2));
process.exit(ok ? 0 : 1);
