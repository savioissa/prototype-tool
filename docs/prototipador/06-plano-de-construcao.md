# 06 — Plano de construção

Sete fases, nesta ordem. Ao fim de cada uma: rode os critérios de aceite, mostre o
resultado ao usuário e **espere a confirmação** antes de começar a próxima.

| Fase | Entrega | Especificação |
|---|---|---|
| 0 | Reconhecimento do projeto (sem código) | `00-visao-geral.md` |
| 1 | Moldura e aba Principal | `01-moldura-e-principal.md` |
| 2 | Gerador: estrutura e registro de componentes | `05-gerador.md` |
| 3 | Área de teste | `02-area-de-teste.md` |
| 4 | Dados | `03-dados.md` + `05-gerador.md` |
| 5 | Traduções | `04-traducoes.md` + `05-gerador.md` |
| 6 | Acabamento | este arquivo |

## Fase 0 — Reconhecimento

Não escreva código nesta fase. Leia o projeto e responda, num relatório curto:

1. Versão do Angular e do PrimeNG. Componentes standalone ou em NgModule? Sintaxe de
   controle nova (`@if`) ou antiga (`*ngIf`)? Inputs por decorator, por signal ou os dois?
2. Onde ficam as telas. Existe uma pasta que possa ser `pastaTelas`?
3. Como as rotas estão declaradas e onde `comPrototipador` entraria.
4. Como a tradução está configurada: biblioteca e versão, carregador, pasta e nomes dos
   arquivos, códigos dos idiomas, se há idioma de reserva.
5. Onde estão os mocks e que forma têm. Eles importam algo além de tipos?
6. O CSV da planilha já está no projeto? Quais são os cabeçalhos?
7. O que já existe no `start` e no `build` do `package.json`.

Depois:

- Crie o `prototipador.config.json` com os valores reais.
- Liste **cada divergência** entre o projeto e as premissas de `00-visao-geral.md`, com uma
  proposta para cada uma. Exemplos: o projeto usa NgModule; os mocks são JSON; a tradução
  não é ngx-translate; não existe uma pasta única de telas.
- Pergunte ao usuário qual coluna do CSV é a chave da tag, se não for evidente.
- Se o projeto ainda não tiver nenhuma tela, proponha criar uma tela de exemplo mínima
  (dois componentes, um mock, algumas tags) em `pastaTelas`, só para validar as fases.

**Aceite:** o usuário leu o relatório e decidiu cada divergência.

## Fase 1 — Moldura e aba Principal

- Pasta `src/app/prototipador/` com `moldura/`, `principal/` e as três abas `_proto` como
  páginas vazias com o título.
- `comPrototipador` aplicado nas rotas.
- Serviços de idioma, "exibir tags" e tela atual.

**Aceite:** os 7 critérios de `01-moldura-e-principal.md`.

## Fase 2 — Gerador: estrutura e componentes

- Pasta `gerador/` com leitura da configuração, modo observação, escrita estável e avisos.
- `modelo/tipos.ts` completo (os três blocos, mesmo que só o primeiro seja preenchido).
- `componentes.gerado.ts` completo. `schema.gerado.ts` e `tags.gerado.ts` gerados vazios.
- Scripts do `package.json` e `gerado/` no `.gitignore`.
- Testes 1, 2, 3 e 7 de `05-gerador.md`.

**Aceite:**

1. `npm start` sobe o gerador e a aplicação com um comando.
2. `npm run proto:testar` passa.
3. Criar um componente nas telas e salvar faz o gerador imprimir a nova contagem.
4. Mostre ao usuário o registro gerado de um componente real do projeto, para ele conferir
   inputs, tipos e filhos.

## Fase 3 — Área de teste

- Lista, palco, eventos, variações e formulário.
- Função `ajustar` e leitura dos arquivos `*.proto.ts`.
- Escreva um arquivo de ajuste para um componente real, como exemplo, **com autorização do
  usuário** (é um arquivo dentro da pasta das telas).

**Aceite:** os 8 critérios de `02-area-de-teste.md`.

## Fase 4 — Dados

- Leitura dos mocks e inferência no gerador. Teste 4 de `05-gerador.md`.
- Aba com o diagrama.

**Aceite:** os 6 critérios de `03-dados.md`. Mostre ao usuário o diagrama dos mocks reais e
pergunte se algum relacionamento inferido está errado; relacionamento errado por regra mal
aplicada é defeito, relacionamento errado porque o mock engana é limitação aceita.

## Fase 5 — Traduções

- Leitura de tags, textos e planilha no gerador. Testes 5 e 6 de `05-gerador.md`.
- Aba com a tabela e a seção de chaves dinâmicas.

**Aceite:** os 7 critérios de `04-traducoes.md`. Compare, com o usuário, a lista de tags de
uma tela real com o que ele espera; anote o que faltou e por quê.

## Fase 6 — Acabamento

- Painel "Avisos" nas três abas, recolhido por padrão, com a contagem no título.
- Todos os estados vazios e de erro descritos nas especificações.
- Revisão visual: o prototipador usa só classes `proto-` e variáveis do tema; nenhum estilo
  global novo.
- `src/app/prototipador/LEIA-ME.md` para quem usa a ferramenta: como subir, o que cada aba
  faz, como escrever um arquivo de ajuste, onde colocar o CSV e como remover o prototipador
  do projeto.

**Aceite:**

1. Uma busca por imports do prototipador dentro de `pastaTelas` só encontra arquivos
   `*.proto.ts`.
2. Apagar a pasta `gerado/` e rodar `npm start` recria tudo.
3. O usuário percorre as 4 abas com uma tela real, sem erro no console.

## Quando parar e perguntar

- O projeto real diverge de uma premissa e a especificação não diz o que fazer.
- Uma funcionalidade só funcionaria alterando o código de uma tela.
- Uma biblioteca instalada não oferece algo que a especificação pressupõe (ex.: sintaxe do
  Mermaid, API do analisador de templates).
- Você precisaria de uma dependência que não está listada em `05-gerador.md`.
- Um critério de aceite não passa e a correção exigiria mudar o comportamento especificado.
