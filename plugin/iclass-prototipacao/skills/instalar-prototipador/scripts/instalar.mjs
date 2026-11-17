// Instala o prototipador num projeto Angular 17. Não roda npm install.
//   node instalar.mjs "<pasta do projeto>" [--planilha "<caminho do CSV>"]
//
// Faz o que é determinístico e relata o resto:
// - extrai pacotes/prototipador.json (código + docs); nunca sobrescreve;
// - cria prototipador.config.json e o bloco do prototipador no CLAUDE.md;
// - copia a planilha e grava planilha.origem;
// - mescla scripts e dependências no package.json;
// - acrescenta gerado/ ao .gitignore;
// - aplica os pontos de contato em app.routes.ts e app.config.ts quando eles estão no formato
//   do esqueleto. Fora desse formato, devolve como "pendente" para o agente resolver.
// Imprime JSON. Sai com código 1 só quando nada pôde ser instalado.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { extrair, lerPacote } from '../../../lib/pacote.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const pasta = resolve(args.find((arg, i) => !arg.startsWith('--') && args[i - 1] !== '--planilha') ?? '.');
const planilha = args.includes('--planilha') ? args[args.indexOf('--planilha') + 1] : null;

const SCRIPTS = {
  'proto:gerar': 'tsx src/app/prototipador/gerador/main.ts',
  'proto:observar': 'tsx src/app/prototipador/gerador/main.ts --observar',
  'proto:planilha': 'tsx src/app/prototipador/gerador/atualizar-planilha.ts',
  'proto:testar': 'tsx --test src/app/prototipador/gerador/testes/*.test.ts',
};
const PRE = 'npm run proto:planilha && npm run proto:gerar';
const START = 'concurrently -k -n gerador,angular "npm:proto:observar" "ng serve"';
const DEPENDENCIAS = { mermaid: '12.3.0' };
const DEPENDENCIAS_DEV = {
  chokidar: '3.6.0',
  concurrently: '10.0.7',
  'csv-parse': '7.0.3',
  'ts-morph': '28.0.0',
  tsx: '4.23.15',
};

const relatorio = { pasta, ok: true, aplicados: [], pendentes: [], conflitos: [], avisos: [] };
const caminho = (...partes) => join(pasta, ...partes);
const ler = (arquivo) => readFileSync(caminho(arquivo), 'utf8');
const escrever = (arquivo, texto) => writeFileSync(caminho(arquivo), texto);

function terminar(codigo = 0) {
  console.log(JSON.stringify(relatorio, null, 2));
  process.exit(codigo);
}

// ---------- 1. Código e documentação ----------
if (existsSync(caminho('src', 'app', 'prototipador'))) {
  relatorio.ok = false;
  relatorio.conflitos.push('src/app/prototipador já existe. Nada foi instalado.');
  terminar(1);
}
const pacote = lerPacote(join(aqui, '..', 'pacotes', 'prototipador.json'));
relatorio.versao = pacote.versaoPlugin;
relatorio.commitDeOrigem = pacote.commit;
const extracao = extrair(pacote, pasta);
if (!extracao.ok) {
  relatorio.ok = false;
  relatorio.conflitos.push(...extracao.conflitos.map((arquivo) => `${arquivo} já existe. Nada foi instalado.`));
  terminar(1);
}
relatorio.aplicados.push(`${extracao.criados.length} arquivos do prototipador e da documentação`);

// ---------- 2. prototipador.config.json e planilha ----------
let config;
if (existsSync(caminho('prototipador.config.json'))) {
  config = JSON.parse(ler('prototipador.config.json'));
  relatorio.avisos.push('prototipador.config.json já existia e foi mantido; confira os caminhos.');
} else {
  config = JSON.parse(readFileSync(join(aqui, '..', 'templates', 'prototipador.config.json'), 'utf8'));
  relatorio.aplicados.push('prototipador.config.json');
}
if (planilha) {
  if (existsSync(planilha)) {
    const destino = caminho(config.planilha.arquivo);
    mkdirSync(dirname(destino), { recursive: true });
    copyFileSync(planilha, destino);
    config.planilha.origem = resolve(planilha);
    relatorio.aplicados.push(`planilha copiada para ${config.planilha.arquivo} (origem guardada no config)`);
  } else {
    relatorio.avisos.push(`Planilha não encontrada em "${planilha}". A aba Traduções vai mostrar "planilha indisponível".`);
  }
}
escrever('prototipador.config.json', `${JSON.stringify(config, null, 2)}\n`);

// ---------- 3. package.json ----------
const pkg = JSON.parse(ler('package.json'));
pkg.scripts ??= {};
for (const [nome, comando] of Object.entries(SCRIPTS)) {
  if (pkg.scripts[nome] && pkg.scripts[nome] !== comando) {
    relatorio.conflitos.push(`script "${nome}" já existe com outro comando; mantido.`);
  } else {
    pkg.scripts[nome] = comando;
  }
}
for (const nome of ['prestart', 'prebuild']) {
  const atual = pkg.scripts[nome];
  if (!atual) {
    pkg.scripts[nome] = PRE;
  } else if (!atual.includes('proto:gerar')) {
    pkg.scripts[nome] = `${atual} && ${PRE}`;
    relatorio.avisos.push(`script "${nome}" já existia; o prototipador foi acrescentado ao final.`);
  }
}
const start = pkg.scripts.start;
if (!start || start === 'ng serve') {
  pkg.scripts.start = START;
} else if (start !== START) {
  relatorio.pendentes.push(
    `script "start" é "${start}". Ele precisa rodar "npm:proto:observar" junto, via concurrently, preservando as opções atuais.`,
  );
}
for (const [secao, lista] of [
  ['dependencies', DEPENDENCIAS],
  ['devDependencies', DEPENDENCIAS_DEV],
]) {
  pkg[secao] ??= {};
  for (const [nome, versao] of Object.entries(lista)) {
    const atual = pkg.dependencies?.[nome] ?? pkg.devDependencies?.[nome];
    if (atual && atual !== versao) {
      relatorio.conflitos.push(`${nome} já está no projeto (${atual}); o prototipador foi testado com ${versao}. Mantido.`);
    } else if (!atual) {
      pkg[secao][nome] = versao;
    }
  }
}
escrever('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
relatorio.aplicados.push('package.json: scripts e dependências do prototipador (rode npm install)');

// ---------- 4. .gitignore ----------
const linhaGerado = '/src/app/prototipador/gerado/';
const gitignore = existsSync(caminho('.gitignore')) ? ler('.gitignore') : '';
if (!gitignore.includes(linhaGerado)) {
  const anterior = gitignore.trimEnd();
  escrever('.gitignore', `${anterior}${anterior ? '\n\n' : ''}# Prototipador: saída do gerador\n${linhaGerado}\n`);
  relatorio.aplicados.push('.gitignore');
}

// ---------- 5. Pontos de contato ----------
function trocar(arquivo, descricao, jaAplicado, regras) {
  if (!existsSync(caminho(arquivo))) {
    relatorio.pendentes.push(`${arquivo} não existe: ${descricao}.`);
    return;
  }
  let texto = ler(arquivo);
  if (jaAplicado.test(texto)) {
    return;
  }
  if (!regras.every(([de]) => texto.includes(de))) {
    relatorio.pendentes.push(`${arquivo} está fora do formato esperado: ${descricao}.`);
    return;
  }
  for (const [de, para] of regras) {
    texto = texto.replace(de, para);
  }
  escrever(arquivo, texto);
  relatorio.aplicados.push(arquivo);
}

trocar(
  'src/app/app.routes.ts',
  'envolva as rotas das telas com comPrototipador(rotasDasTelas), importado de ./prototipador/rotas',
  /comPrototipador\(/,
  [
    ["import { Routes } from '@angular/router';", "import { Routes } from '@angular/router';\n\nimport { comPrototipador } from './prototipador/rotas';"],
    ['export const routes: Routes = rotasDasTelas;', 'export const routes: Routes = comPrototipador(rotasDasTelas);'],
  ],
);
trocar(
  'src/app/app.config.ts',
  'envolva o carregador de traduções com comExibirTags(...), importado de ./prototipador/principal/carregador-com-tags',
  /comExibirTags\(/,
  [
    ["import { routes } from './app.routes';", "import { routes } from './app.routes';\nimport { comExibirTags } from './prototipador/principal/carregador-com-tags';"],
    ['useFactory: criarCarregadorDeTraducoes,', 'useFactory: (http: HttpClient) => comExibirTags(criarCarregadorDeTraducoes(http)),'],
  ],
);

// O gerador tem tsconfig próprio; o do app não pode incluí-lo.
if (existsSync(caminho('tsconfig.app.json'))) {
  const tsApp = JSON.parse(ler('tsconfig.app.json').replace(/^\s*\/\*.*?\*\/\s*/s, ''));
  if ((tsApp.include ?? []).some((padrao) => /src\/\*\*\/\*\.ts$/.test(padrao))) {
    relatorio.pendentes.push('tsconfig.app.json inclui src/**/*.ts: exclua "src/app/prototipador/gerador/**".');
  }
}

// ---------- 6. CLAUDE.md ----------
const bloco = readFileSync(join(aqui, '..', 'templates', 'CLAUDE.md'), 'utf8').replace('{{versao}}', pacote.versaoPlugin);
if (!existsSync(caminho('CLAUDE.md'))) {
  escrever('CLAUDE.md', bloco);
  relatorio.aplicados.push('CLAUDE.md');
} else if (!ler('CLAUDE.md').includes('<!-- prototipador:inicio')) {
  escrever('CLAUDE.md', `${ler('CLAUDE.md').trimEnd()}\n\n${bloco}`);
  relatorio.aplicados.push('CLAUDE.md (bloco do prototipador acrescentado ao final)');
}

relatorio.proximoPasso = relatorio.pendentes.length
  ? 'Resolver os pendentes, depois npm install e validar.mjs'
  : 'npm install, depois validar.mjs';
terminar(0);
