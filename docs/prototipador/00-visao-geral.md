# 00 — Visão geral

## O que é

Uma ferramenta de prototipação que roda em `localhost`, dentro do mesmo projeto Angular +
PrimeNG da tela que está sendo construída. Ela envolve a tela com um menu lateral de 4 abas:

| Aba | Rota | O que mostra | Especificação |
|---|---|---|---|
| Principal | rotas da própria tela | A tela funcionando normalmente | `01-moldura-e-principal.md` |
| Área de teste | `/_proto/teste` | Um componente isolado, com variações e dados editáveis | `02-area-de-teste.md` |
| Dados | `/_proto/dados` | Diagrama de entidades, atributos e relacionamentos | `03-dados.md` |
| Traduções | `/_proto/traducoes` | As tags de tradução usadas na tela | `04-traducoes.md` |

Quem usa é o time de design e produto. Ninguém cadastra nada na ferramenta: o conteúdo das
abas de teste, dados e traduções vem da leitura do código da tela.

## Arquitetura

```
  código da tela ──► gerador (Node) ──► arquivos gerados ──► abas do prototipador
  (componentes,       roda junto com     componentes           (Angular, no navegador)
   mocks, i18n,       o ng serve         schema
   planilha)                             tags
```

- **Gerador** (`05-gerador.md`): script Node que lê componentes, mocks, arquivos i18n e a
  planilha de tags, e escreve três arquivos em `src/app/prototipador/gerado/`. Roda uma vez
  antes do `ng serve` e de novo a cada alteração.
- **Interface**: componentes Angular que importam os arquivos gerados e os exibem. Como os
  arquivos gerados são código-fonte, o recarregamento automático do `ng serve` atualiza as
  abas sozinho.
- **Modelo** (`src/app/prototipador/modelo/`): os tipos dos arquivos gerados, em TypeScript
  puro (sem imports do Angular nem do Node), para serem usados pelos dois lados.

## Conceitos

**Tela atual.** A última rota visitada na aba Principal. É o escopo padrão da área de teste
e da aba de traduções. Como é calculada: `01-moldura-e-principal.md`, seção "Tela atual".

**Componentes da tela atual.** Os componentes ligados à rota da tela atual mais todos os
componentes do projeto que aparecem, direta ou indiretamente, nos templates deles.

**Variação.** Um conjunto nomeado de valores de inputs de um componente. "Estado" e
"variação" são a mesma coisa na ferramenta (ex.: "Ativa", "Inativa", "Carregando").

**Arquivo de ajuste.** Arquivo opcional `<componente>.proto.ts`, ao lado do componente, que
complementa o que o gerador deduz sozinho.

**Aviso do gerador.** Algo que o gerador não conseguiu ler ou deduzir. Nunca interrompe a
geração; aparece na aba correspondente, num painel discreto "Avisos".

## Configuração

Um arquivo `prototipador.config.json` na raiz do projeto guarda tudo o que depende do
projeto real. O gerador lê esse arquivo; nenhum caminho fica fixo no código.

```json
{
  "pastaTelas": "src/app/telas",
  "mocks": "src/app/telas/**/*.mock.ts",
  "i18n": {
    "pasta": "src/assets/i18n",
    "idiomas": { "pt": "pt.json", "en": "en.json", "es": "es.json" }
  },
  "traducao": { "pipe": "translate", "servico": "TranslateService" },
  "planilha": {
    "arquivo": "src/app/prototipador/entrada/tags.csv",
    "colunaChave": ""
  }
}
```

| Campo | Significado |
|---|---|
| `pastaTelas` | Pasta onde o gerador procura componentes. Nada fora dela é lido |
| `mocks` | Padrão de arquivos de dados mockados |
| `i18n.pasta` e `i18n.idiomas` | Onde estão os arquivos de tradução e qual arquivo corresponde a PT, EN e ES |
| `traducao.pipe` e `traducao.servico` | Nome do pipe e do serviço de tradução usados nas telas |
| `planilha.arquivo` | CSV exportado da planilha de tags |
| `planilha.colunaChave` | Nome do cabeçalho da coluna que contém a chave da tag |

Os valores acima são as premissas iniciais. Na fase 0 você confere cada um contra o projeto
real e corrige o arquivo.

## Premissas

Confirmadas pelo usuário:

1. As telas usam Angular + PrimeNG.
2. A tradução usa ngx-translate, com um arquivo JSON por idioma (PT, EN e ES).
3. A planilha de tags é exportada em CSV para dentro do projeto.
4. Os mocks são arquivos `*.mock.ts` que exportam listas de objetos.

Ainda desconhecidas (descubra na fase 0; pergunte o que não der para descobrir):

- Versão do Angular e do PrimeNG, e se os componentes são standalone.
- Estrutura real de pastas das telas.
- Qual coluna do CSV contém a chave da tag (`planilha.colunaChave`).

## Fora do escopo

Não construa nada disto, mesmo que pareça uma melhoria óbvia:

- Troca de viewport, troca de tema ou seletor de tela na aba Principal.
- Editor JSON e presets prontos de dados (mínimo, máximo, vazio) na área de teste.
- Edição do schema ou tabela de detalhes ao clicar numa entidade na aba de dados.
- Alerta de tradução faltando e edição de traduções na aba de traduções.
- Persistência em servidor, autenticação ou qualquer chamada de rede feita pelo prototipador.
- Testes automatizados da interface do prototipador (o gerador tem testes; ver
  `05-gerador.md`).
