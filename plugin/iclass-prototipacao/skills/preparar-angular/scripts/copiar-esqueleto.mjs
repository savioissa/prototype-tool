// Cria o projeto Angular base a partir de pacotes/esqueleto.json. Não instala dependências.
//   node copiar-esqueleto.mjs "<pasta do projeto>" --nome <nome-em-kebab-case>
// Imprime JSON. Sai com código 1 se o nome for inválido ou se algum arquivo já existir.
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { extrair, lerPacote } from '../../../lib/pacote.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const pasta = resolve(args.find((arg) => !arg.startsWith('--')) ?? '.');
const nome = args[args.indexOf('--nome') + 1];

function sair(dados, codigo) {
  console.log(JSON.stringify(dados, null, 2));
  process.exit(codigo);
}

if (args.indexOf('--nome') < 0 || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(nome ?? '')) {
  sair({ ok: false, erro: 'Informe --nome em kebab-case (ex.: --nome prototipo-filial).' }, 1);
}

const nomePascal = nome
  .split('-')
  .map((parte) => parte[0].toUpperCase() + parte.slice(1))
  .join('');

const pacote = lerPacote(join(aqui, '..', 'pacotes', 'esqueleto.json'));
const resultado = extrair(pacote, pasta, {
  substituicoes: { 'esqueleto-prototipo': nome, EsqueletoPrototipo: nomePascal },
  regras: { 'README.md': 'manter', '.gitignore': 'mesclarLinhas', '.vscode/extensions.json': 'manter', '.vscode/launch.json': 'manter', '.vscode/tasks.json': 'manter' },
});

sair(
  {
    pasta,
    nome,
    nomePascal,
    versaoDoPacote: pacote.versaoPlugin,
    ...resultado,
    criados: resultado.criados.length,
    proximoPasso: resultado.ok ? 'npm ci' : 'Há arquivos que seriam sobrescritos (ver "conflitos"). Nada foi escrito.',
  },
  resultado.ok ? 0 : 1,
);
