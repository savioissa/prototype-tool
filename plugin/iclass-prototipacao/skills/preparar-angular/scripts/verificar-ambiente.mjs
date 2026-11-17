// Confere Node, npm e git. Imprime JSON e sai com código 0 mesmo quando algo falta:
// quem decide o que fazer é a skill.
//   node verificar-ambiente.mjs
//
// Node aceito: 20 (a partir do 20.9, mínimo do Angular 17) e 22 (a partir do 22.12).
// O 22 é o recomendado: algumas dependências do prototipador (mermaid 12, concurrently 10)
// declaram exigir Node 22. No Node 20 o fluxo foi testado e funciona, mas o npm mostra avisos
// "EBADENGINE" e o Node 20 não recebe mais atualizações desde abril de 2026.
import { spawnSync } from 'node:child_process';

function versaoDe(comando) {
  // shell: true para achar npm.cmd e git.exe no Windows
  const resultado = spawnSync(comando, ['--version'], { shell: true, encoding: 'utf8' });
  if (resultado.status !== 0) {
    return null;
  }
  const encontrada = resultado.stdout.match(/\d+\.\d+\.\d+/);
  return encontrada ? encontrada[0] : resultado.stdout.trim();
}

const [maior, menor] = process.versions.node.split('.').map(Number);
const recomendado = maior === 22 && menor >= 12;
const aceito = recomendado || (maior === 20 && menor >= 9);

const npm = versaoDe('npm');
const git = versaoDe('git');

const problemas = [];
const avisos = [];
if (!aceito) {
  problemas.push(
    `Node ${process.versions.node} instalado; o projeto aceita Node 20 (20.9 ou mais novo) ou 22 (22.12 ou mais novo), ` +
      'e recomenda o 22. Instale com nvm-windows ("nvm install 22" e "nvm use 22").',
  );
} else if (!recomendado) {
  avisos.push(
    `Node ${process.versions.node}: funciona, mas o recomendado é o Node 22. O npm vai mostrar avisos "EBADENGINE" ` +
      'de algumas dependências; eles podem ser ignorados. O Node 20 não recebe mais atualizações de segurança.',
  );
}
if (!npm) {
  problemas.push('npm não encontrado. Ele vem junto com o Node; reinstale o Node.');
}

console.log(
  JSON.stringify(
    {
      ok: aceito && Boolean(npm),
      sistema: process.platform,
      node: { versao: process.versions.node, aceito: '>=20.9.0 <21 ou >=22.12.0 <23', recomendado: '22', ok: aceito, ehRecomendado: recomendado },
      npm: { versao: npm, ok: Boolean(npm) },
      git: { versao: git, ok: Boolean(git), observacao: git ? null : 'Sem git: o projeto não terá histórico nem ponto de retorno.' },
      problemas,
      avisos,
    },
    null,
    2,
  ),
);
