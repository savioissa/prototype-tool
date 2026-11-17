<!-- prototipador:inicio (bloco mantido pelo plugin iclass-prototipacao; versão {{versao}}) -->
# Protótipo IClass

Projeto Angular 17 + PrimeNG 17 com duas partes que convivem, mas não se misturam:

- **As telas** do protótipo, em `src/app/telas/`: sem back-end, com dados mockados.
- **O prototipador**, em `src/app/prototipador/`: uma moldura com menu lateral que envolve as
  telas e ajuda o time de design e produto a inspecioná-las (Principal, Área de teste, Dados e
  Traduções). Ele lê o código das telas; ninguém cadastra nada nele.

A especificação do prototipador está em `docs/prototipador/`. Consulte antes de mexer nele.

## Regras que valem sempre

1. **Dependência em um sentido só.** O prototipador lê as telas. Nenhum arquivo de
   `src/app/telas/` importa algo de `src/app/prototipador/`, com uma exceção: os arquivos de
   ajuste `*.proto.ts` (ver `docs/prototipador/02-area-de-teste.md`).
2. **Não altere o prototipador para acomodar uma tela.** O código em `src/app/prototipador/`
   vem do plugin `iclass-prototipacao` e é substituído quando ele é atualizado. Se o
   prototipador não lida com algo da tela, relate em vez de corrigir aqui.
3. **Arquivos gerados não são editados à mão.** Tudo em `src/app/prototipador/gerado/` é
   produzido pelo gerador e está no `.gitignore`.
4. **Versões fixas.** Angular 17.3, PrimeNG 17.18 e ngx-translate 15, nas versões exatas do
   `package-lock.json`. Não atualize dependências sem pedido explícito. Use os componentes e a
   API do PrimeNG 17 (ex.: `p-dropdown`, `p-calendar`), não os de versões mais novas.
5. **Isolamento visual.** Seletores e classes do prototipador começam com `proto-`. As telas
   não usam esse prefixo, e o prototipador não altera estilos globais.

## Como construir uma tela para o prototipador ler bem

- **Onde:** uma pasta por funcionalidade em `src/app/telas/` (ex.: `telas/filial/`), com
  componentes standalone e sintaxe `@if`/`@for`.
- **Rota:** registre em `rotasDasTelas`, no `src/app/app.routes.ts`. Não mexa na linha
  `comPrototipador(rotasDasTelas)`.
- **Dados:** mocks em arquivos `*.mock.ts` que exportam listas de objetos tipadas
  (`export const filiais: Filial[] = [...]`). A aba Dados infere entidades e relacionamentos
  daí: use `id` como chave e `<entidade>Id` para referências.
- **Textos:** sempre pelo pipe `translate` com tags da planilha
  (`{{ 'generic.label.branch' | translate }}`). Parâmetros posicionais:
  `'tag' | translate: { '0': valor }`. Os textos ficam em `src/assets/i18n/{pt,en,es}.json`.
- **Inputs:** tipe todos os `@Input()`/`input()`. Tipos simples, uniões de literais e
  interfaces viram campos editáveis na Área de teste.
- **Variações:** quando um componente tem estados importantes, crie um `<componente>.proto.ts`
  ao lado dele com `ajustar(...)` (modelo em `docs/prototipador/02-area-de-teste.md`).

## Comandos

| Comando | O que faz |
|---|---|
| `npm start` | Atualiza a planilha, gera os arquivos do prototipador e sobe o projeto em http://localhost:4200 |
| `npm run proto:gerar` | Roda o gerador uma vez |
| `npm run proto:planilha` | Copia a planilha de tags de `planilha.origem` (no `prototipador.config.json`) para o projeto |
| `npm run proto:testar` | Testes do gerador |
| `npm run build` | Build de produção |

## Planilha de tags

O CSV exportado da planilha fica em `src/app/prototipador/entrada/tags.csv`. Se
`planilha.origem` estiver configurado no `prototipador.config.json`, `npm start` copia a versão
mais nova de lá automaticamente.

## Como trabalhar

- Escreva código, comentários e mensagens em português; nomes de classes e arquivos seguem o
  que o projeto já usa.
- Antes de instalar uma dependência nova, pergunte.
<!-- prototipador:fim -->
