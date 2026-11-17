// Descobre em que cenário a pasta está e reúne fatos para o reconhecimento.
// Imprime JSON. Não altera nada.
//   node detectar-projeto.mjs "<pasta do projeto>"
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const pasta = resolve(process.argv[2] ?? '.');

// O que pode existir numa pasta "vazia" (criada pela IDE ou pelo git).
const IGNORADOS = new Set(['.git', '.vscode', '.claude', '.idea', 'README.md', '.gitignore', '.DS_Store', 'Thumbs.db']);

const lerJson = (caminho) => {
  try {
    return JSON.parse(readFileSync(caminho, 'utf8'));
  } catch {
    return null;
  }
};
const lerTexto = (caminho) => (existsSync(caminho) ? readFileSync(caminho, 'utf8') : null);

/** Versão instalada (node_modules) ou, se não instalado, a faixa declarada no package.json. */
function versao(pacote, pkg) {
  const instalado = lerJson(join(pasta, 'node_modules', pacote, 'package.json'));
  if (instalado?.version) {
    return { versao: instalado.version, fonte: 'node_modules' };
  }
  const declarada = pkg?.dependencies?.[pacote] ?? pkg?.devDependencies?.[pacote];
  return declarada ? { versao: declarada, fonte: 'package.json' } : null;
}

const maior = (texto) => Number(String(texto).match(/\d+/)?.[0] ?? NaN);

function detectar() {
  if (!existsSync(pasta)) {
    return { cenario: 'outro', motivo: `A pasta ${pasta} não existe.` };
  }
  const entradas = readdirSync(pasta);
  const relevantes = entradas.filter((nome) => !IGNORADOS.has(nome));
  if (!relevantes.length) {
    return { cenario: 'vazio', existentes: entradas };
  }

  const pkg = lerJson(join(pasta, 'package.json'));
  const angular = versao('@angular/core', pkg);
  if (!pkg || !angular) {
    return { cenario: 'outro', motivo: 'A pasta tem arquivos, mas não é um projeto Angular.', existentes: relevantes.slice(0, 20) };
  }

  const fatos = {
    angular,
    primeng: versao('primeng', pkg),
    primeicons: versao('primeicons', pkg),
    ngxTranslate: versao('@ngx-translate/core', pkg),
    ngxTranslateHttpLoader: versao('@ngx-translate/http-loader', pkg),
    typescript: versao('typescript', pkg),
    dependenciasInstaladas: existsSync(join(pasta, 'node_modules')),
    standalone: /bootstrapApplication\s*\(/.test(lerTexto(join(pasta, 'src', 'main.ts')) ?? ''),
    arquivos: {
      appRoutes: existsSync(join(pasta, 'src', 'app', 'app.routes.ts')),
      appConfig: existsSync(join(pasta, 'src', 'app', 'app.config.ts')),
      appModule: existsSync(join(pasta, 'src', 'app', 'app.module.ts')),
      pastaTelas: existsSync(join(pasta, 'src', 'app', 'telas')),
      pastaI18n: existsSync(join(pasta, 'src', 'assets', 'i18n')),
      parserPosicional: existsSync(join(pasta, 'src', 'app', 'traducao', 'parser-posicional.ts')),
      claudeMd: existsSync(join(pasta, 'CLAUDE.md')),
    },
    scripts: { start: pkg.scripts?.start ?? null, build: pkg.scripts?.build ?? null },
    node: { nvmrc: lerTexto(join(pasta, '.nvmrc'))?.trim() ?? null, engines: pkg.engines?.node ?? null },
    git: existsSync(join(pasta, '.git')),
  };

  if (existsSync(join(pasta, 'src', 'app', 'prototipador'))) {
    return { cenario: 'prototipador-instalado', ...fatos };
  }
  if (maior(angular.versao) !== 17) {
    return { cenario: 'angular-outra-versao', motivo: `Angular ${angular.versao}; o prototipador só foi testado no 17.`, ...fatos };
  }
  return { cenario: 'angular17', ...fatos };
}

console.log(JSON.stringify({ pasta, ...detectar() }, null, 2));
