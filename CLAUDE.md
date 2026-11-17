# Prototipador

Este projeto Angular + PrimeNG contém duas coisas que convivem, mas não se misturam:

- **As telas** em construção (protótipos sem back-end, com dados mockados).
- **O prototipador**: uma moldura com menu lateral de 4 abas que envolve as telas e ajuda a
  inspecioná-las. É o que você vai construir.

A especificação completa está em `docs/prototipador/`. Leia `00-visao-geral.md` antes de
qualquer tarefa e siga `06-plano-de-construcao.md` fase a fase.

## Regras que valem sempre

1. **Dependência em um sentido só.** O prototipador lê as telas. Nenhum arquivo dentro da
   pasta das telas importa algo de `src/app/prototipador/`, com uma exceção: os arquivos de
   ajuste `*.proto.ts` (ver `02-area-de-teste.md`).
2. **Pontos de contato permitidos** fora da pasta do prototipador: `app.routes.ts`,
   `app.config.ts` (ou equivalentes), `package.json`, `.gitignore` e
   `prototipador.config.json`. Qualquer outro arquivo fora da pasta do prototipador só é
   alterado com autorização do usuário.
3. **Nunca altere o comportamento ou o visual das telas** para acomodar o prototipador. Se
   algo na tela impede uma funcionalidade, pare e relate.
4. **Siga o que o projeto já usa.** Versão do Angular, standalone ou NgModule, sintaxe de
   template, versão do PrimeNG e nomes dos componentes PrimeNG vêm do que está instalado,
   não do que você lembra. Confira em `package.json` e no código existente.
5. **Não invente.** Quando a especificação não cobre um caso, ou o projeto real diverge de
   uma premissa, pare e pergunte. Não preencha a lacuna com um palpite.
6. **O prototipador não é traduzido.** Os textos da interface dele ficam fixos em
   português, direto no template, sem o pipe de tradução. Assim eles não aparecem na aba de
   traduções nem mudam no modo "exibir tags".
7. **Isolamento visual.** Todo seletor de componente do prototipador começa com `proto-` e
   toda classe CSS com `proto-`. O prototipador não adiciona nem altera estilos globais.
8. **Arquivos gerados não são editados à mão.** Tudo em `src/app/prototipador/gerado/` é
   produzido pelo gerador e está no `.gitignore`.

## Comandos

| Comando | O que faz |
|---|---|
| `npm start` | Gera os arquivos, sobe o gerador em modo observação e o `ng serve` |
| `npm run proto:gerar` | Roda o gerador uma vez |
| `npm run proto:observar` | Roda o gerador a cada alteração nas telas |
| `npm run proto:planilha` | Copia a planilha de tags de `planilha.origem` para `planilha.arquivo` |
| `npm run plugin:empacotar` | Atualiza os pacotes do plugin `iclass-prototipacao` (ver `plugin/LEIA-ME.md`) |

## Onde fica cada coisa

```
prototipador.config.json        caminhos e convenções do projeto (lido pelo gerador)
docs/prototipador/              especificação
src/app/prototipador/
├─ modelo/                      tipos compartilhados entre gerador e interface
├─ moldura/                     menu lateral e área de conteúdo
├─ principal/                   barra de idioma e modo "exibir tags"
├─ teste/                       área de teste
├─ dados/                       diagrama de entidades
├─ traducoes/                   tabela de tags
├─ entrada/                     planilha de tags em CSV
├─ gerador/                     script Node (não entra no bundle do app)
└─ gerado/                      saída do gerador
```

## Como trabalhar

- Uma fase por vez. Ao terminar, rode os critérios de aceite da fase, mostre o resultado ao
  usuário e espere a confirmação antes de seguir.
- Escreva código, comentários e mensagens de interface em português. Nomes de classes e
  arquivos seguem a convenção já usada no projeto.
- Antes de instalar uma dependência que não está listada na especificação, pergunte.
