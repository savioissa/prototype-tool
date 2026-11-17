# EsqueletoPrototipo

Protótipo IClass em Angular 17 + PrimeNG 17, com tradução por ngx-translate (pt, en, es).

## Requisitos

- Node 22 (recomendado, versão em `.nvmrc`) ou Node 20.9+. Com nvm-windows: `nvm use 22`.
  No Node 20, o `npm` mostra avisos `EBADENGINE` que podem ser ignorados.

## Comandos

| Comando | O que faz |
|---|---|
| `npm ci` | Instala as dependências nas versões exatas do `package-lock.json` |
| `npm start` | Sobe o protótipo em http://localhost:4200 |
| `npm run build` | Gera a versão de produção em `dist/` |

## Onde fica cada coisa

| Pasta | Conteúdo |
|---|---|
| `src/app/telas/` | As telas do protótipo, com seus componentes e mocks (`*.mock.ts`) |
| `src/app/app.routes.ts` | Rotas das telas (`rotasDasTelas`) |
| `src/assets/i18n/` | Textos traduzidos: `pt.json`, `en.json`, `es.json` |
| `src/app/traducao/` | Parser que aceita parâmetros posicionais (`{0}`, `{1}`) nas tags |
