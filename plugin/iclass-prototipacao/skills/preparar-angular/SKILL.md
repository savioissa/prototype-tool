---
name: preparar-angular
description: Prepara a base Angular de um protótipo IClass. Numa pasta vazia, cria o projeto Angular 17.3 + PrimeNG 17 + ngx-translate (pt/en/es, parser posicional) a partir do esqueleto do plugin, com as versões exatas do template. Num projeto Angular 17 existente, faz o reconhecimento e lista as divergências. Normalmente é chamada pela skill novo-prototipo; use direto quando pedirem só para "criar o projeto Angular padrão IClass" ou "verificar se um projeto está pronto para o prototipador".
---

# Preparar Angular

Deixa o projeto pronto para receber o prototipador. Não instala nada do prototipador.

Se você foi chamada pela skill `novo-prototipo`, o ambiente e o cenário já foram verificados
e o nome do projeto já foi escolhido. Se foi chamada direto, rode antes os scripts
`verificar-ambiente.mjs` e `detectar-projeto.mjs` da pasta `scripts/` desta skill (o que fazer
com o resultado está na skill `novo-prototipo`, etapa 1).

Chame os scripts com o caminho absoluto, entre aspas: no Windows os caminhos costumam ter
espaços e acentos.

## Padrão IClass (não perguntar)

Estas escolhas são fixas. Não pergunte à pessoa e não troque por versões "mais novas":

| Item | Valor |
|---|---|
| Node | 22.12+ recomendado (`.nvmrc` = `22`); 20.9+ aceito (`engines` no `package.json` aceita os dois) |
| Angular / CLI | 17.3.12 / 17.3.17, standalone, sintaxe `@if`/`@for` |
| PrimeNG / PrimeIcons | 17.18.15 / 7.0.0, tema `lara-light-blue`, ripple ligado |
| Tradução | `@ngx-translate/core` 15.0.0 + `http-loader` 8.0.0, idiomas `pt`, `en`, `es`, padrão `pt` |
| Parâmetros de tradução | `ParserPosicional` (`{0}`, `{1}`), em `src/app/traducao/parser-posicional.ts` |
| Mensagens | `MessageService` na raiz e um único `<p-toast>` no `AppComponent` |
| Pasta das telas | `src/app/telas/` |

As versões exatas estão no `package-lock.json` do esqueleto, que é a fonte da verdade. Os
números acima são para você conferir e relatar, não para instalar um por um.

## Cenário A — pasta vazia

O projeto não é criado com `ng new`. Ele é copiado de `pacotes/esqueleto.json`, o projeto
de referência já testado. Assim o resultado é sempre o mesmo, as versões batem com o
`package-lock.json` e não depende da versão do CLI instalada na máquina.

1. Copie o esqueleto:

   ```bash
   node "<pasta desta skill>/scripts/copiar-esqueleto.mjs" "." --nome "<nome-do-projeto>"
   ```

   O script troca o nome do projeto (kebab-case no `package.json` e no `angular.json`,
   PascalCase no título da página) e se recusa a sobrescrever arquivos. Um `README.md` que já
   existia é mantido; um `.gitignore` que já existia recebe as linhas que faltam. Se o JSON
   vier com `ok: false`, nada foi escrito: mostre os `conflitos` e pare.

2. Instale as dependências com `npm ci` (não `npm install`: o `ci` respeita o lock à risca).
   Pode levar alguns minutos; avise a pessoa. Se falhar por rede ou proxy, mostre a mensagem
   de erro resumida e pare. Avisos `EBADENGINE` no Node 20 são esperados e não são erro.

3. Confira com `npx ng build --configuration development`. Precisa terminar sem erro.

4. Se houver git: `git init` (se a pasta ainda não for repositório) e um primeiro commit
   "Projeto base criado pela skill preparar-angular". Esse commit serve de ponto de retorno
   caso a instalação do prototipador dê errado.

5. Devolva um resumo: pasta, nome, versões instaladas (leia do `node_modules`, não do
   esqueleto) e resultado do build.

### O que o esqueleto contém

Veja `references/esqueleto.md` para a lista arquivo por arquivo e o motivo de cada um. Os
pontos que a skill `instalar-prototipador` vai alterar depois estão marcados lá. Em
particular, `app.routes.ts` nasce assim, para que o encaixe seja trocar uma única linha:

```ts
export const rotasDasTelas: Routes = [];
export const routes: Routes = rotasDasTelas;
```

## Cenário B — projeto Angular 17 existente

Não instale, não atualize e não altere nada nesta etapa. Leia o projeto e produza o relatório
de reconhecimento (o modelo está em `references/reconhecimento.md`), respondendo:

1. Versões de Angular, PrimeNG e TypeScript instaladas. Standalone ou NgModule? `@if` ou
   `*ngIf`? Inputs por decorator, por signal ou os dois?
2. Onde ficam as telas e se existe uma pasta que possa ser `pastaTelas`.
3. Como as rotas estão declaradas e onde `comPrototipador` entraria.
4. Tradução: biblioteca e versão, carregador, pasta e nomes dos arquivos, códigos de idioma,
   idioma de reserva, se usa parâmetros posicionais.
5. Onde estão os mocks e que forma têm (`*.mock.ts` exportando listas de objetos?).
6. O que já existe nos scripts `start` e `build` do `package.json`.
7. Versão do Node exigida pelo projeto, se houver (`.nvmrc`, `engines`).

Depois, liste **cada divergência** em relação ao padrão IClass da tabela acima, com uma
proposta para cada uma. Exemplos: o projeto usa NgModule; não tem ngx-translate; os
idiomas são outros; não há `ParserPosicional`; a versão do PrimeNG é outra dentro do 17.

Regras deste cenário:

- Divergência que só se resolve alterando telas não tem proposta automática: descreva e
  deixe a decisão com a pessoa.
- Faltar algo do padrão (ex.: `ParserPosicional`) é proposta de adicionar, nunca de trocar o
  que o projeto já usa.
- Não decida nada. O checkpoint 1 da `novo-prototipo` é onde a pessoa escolhe.

## Quando parar

- `npm ci` ou o build falham e a causa não está no esqueleto.
- O projeto existente diverge de um jeito que a lista acima não cobre.
- Qualquer passo exigiria alterar arquivos fora da pasta do projeto ou instalar algo global.
