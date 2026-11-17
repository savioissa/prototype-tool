---
name: instalar-prototipador
description: Instala o prototipador IClass (moldura com as abas Principal, Área de teste, Dados e Traduções, mais o gerador que lê as telas) num projeto Angular 17 + PrimeNG + ngx-translate. Normalmente é chamada pela skill novo-prototipo depois da preparar-angular; use direto quando pedirem para "instalar", "adicionar" ou "colocar o prototipador" num projeto Angular 17 que já está pronto.
---

# Instalar prototipador

Coloca o prototipador num projeto Angular 17 já preparado. O código vem pronto do pacote
`pacotes/prototipador.json` (gerado a partir do prototype-tool) e não deve ser reescrito: o
seu trabalho é aplicar o pacote, resolver o que o script não conseguiu e validar.

Os scripts ficam na pasta desta skill. Chame-os com o caminho absoluto, entre aspas
(caminhos no Windows costumam ter espaços e acentos), a partir da pasta do projeto.

## O que você recebe

- **Cenário:** A (projeto criado agora pelo esqueleto) ou B (projeto que já existia).
- **Decisões do checkpoint 1** (cenário B): o que fazer com cada divergência.
- **Caminho da planilha de tags**, se houver.

Se foi chamada direto, sem a `novo-prototipo`, rode antes o `detectar-projeto.mjs` da skill
`preparar-angular`. Siga só com `cenario` igual a `angular17`.

## 1. Aplicar o pacote

```bash
node "<pasta desta skill>/scripts/instalar.mjs" "." --planilha "<caminho do CSV>"
```

Sem planilha, omita `--planilha`. O script imprime JSON com `aplicados`, `pendentes`,
`conflitos` e `avisos`.

- **Conflitos com `ok: false`:** nada foi instalado (já existe `src/app/prototipador/` ou um
  arquivo do pacote). Pare e relate.
- **Conflitos com `ok: true`:** o script manteve o que o projeto tinha (ex.: um script do
  `package.json` com outro comando, uma dependência em outra versão). Leve cada um para o
  relatório final; não troque sem a pessoa decidir.
- **Pendentes:** pontos de contato que não estavam no formato esperado. No cenário A não deve
  haver nenhum; se houver, o esqueleto e o pacote estão desalinhados: pare e relate. No
  cenário B, resolva cada um à mão (seção 2).

## 2. Pontos de contato (só quando o script deixou pendente)

Estes são os **únicos** arquivos fora de `src/app/prototipador/` que você pode alterar:
`app.routes.ts`, `app.config.ts`, `package.json`, `.gitignore`, `tsconfig*.json`,
`prototipador.config.json` e `CLAUDE.md`. Qualquer outro arquivo, em especial dentro de
`src/app/telas/`, só com autorização da pessoa. O motivo: o prototipador precisa poder ser
removido desfazendo esses pontos e apagando a pasta.

| Pendente | Como resolver |
|---|---|
| Rotas | Separe as rotas das telas numa constante e exporte `routes = comPrototipador(rotasDasTelas)`, importando de `./prototipador/rotas`. URLs, guards e resolvers das telas não mudam. |
| Carregador de traduções | Envolva o carregador que o projeto já usa: `useFactory: (http) => comExibirTags(carregadorOriginal(http))`, importando de `./prototipador/principal/carregador-com-tags`. Não substitua o carregador. |
| Script `start` | Rode o observador junto, preservando as opções atuais: `concurrently -k -n gerador,angular "npm:proto:observar" "<start atual>"`. |
| `tsconfig.app.json` | Exclua `src/app/prototipador/gerador/**`, que é código Node. |

Projeto com NgModule em vez de standalone, ou tradução que não é ngx-translate, não tem
receita aqui: isso deveria ter sido decidido no checkpoint 1. Se chegou até aqui sem decisão,
pare e pergunte.

## 3. Instalar as dependências

```bash
npm install
```

O script já gravou as versões exatas no `package.json`; o `npm install` atualiza o lock.

## 4. Validar

```bash
node "<pasta desta skill>/scripts/validar.mjs" "."
```

O script confere arquivos, pontos de contato e isolamento das telas, e roda `proto:gerar`,
`proto:testar` e `ng build --configuration development`. Ele imprime JSON com uma lista de
checagens, cada uma com `ok` e, nos comandos, o final da saída.

Se algo falhar:

1. Leia o `detalhe` da checagem. Erro de tipo ou de import num arquivo de ponto de contato é
   seu: corrija e valide de novo.
2. Erro dentro de `src/app/prototipador/` não se corrige aqui. Esse código é a cópia do
   pacote; corrigir no projeto faria ele divergir do prototype-tool. Relate com o trecho do
   erro e a versão do pacote (`versao` no JSON do instalar).
3. Erro em telas (cenário B) que impede o build também não é seu: relate.

Tente no máximo duas rodadas de correção antes de relatar.

## 5. Devolver o resultado

Devolva para a `novo-prototipo` (ou para a pessoa, se chamada direto):

- versão do pacote instalado;
- o que foi aplicado automaticamente e o que você resolveu à mão;
- conflitos mantidos e avisos (planilha não encontrada, config preexistente);
- resultado de cada checagem do `validar.mjs`.

## Remover o prototipador

Se a pessoa pedir para desfazer: no cenário A com git, volte ao commit "Projeto base criado
pela skill preparar-angular". Sem git, ou no cenário B, desfaça os pontos de contato, remova
os scripts `proto:*` e as dependências que o instalar acrescentou (mermaid, chokidar,
concurrently, csv-parse, ts-morph, tsx), apague `src/app/prototipador/`,
`docs/prototipador/`, `prototipador.config.json`, os arquivos `*.proto.ts` das telas e o bloco
entre `<!-- prototipador:inicio` e `<!-- prototipador:fim -->` do `CLAUDE.md`.
