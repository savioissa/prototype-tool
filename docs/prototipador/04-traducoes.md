# 04 — Traduções

## Propósito

Mostrar todas as tags de tradução usadas na tela que está sendo construída: a chave, os
textos nos três idiomas, se a tag é nova ou já existe, e onde e em que contexto é usada.

## Fontes

| Fonte | O que fornece |
|---|---|
| Templates e arquivos `.ts` dos componentes | Quais chaves são usadas, onde e em que contexto |
| Arquivos i18n do projeto | Os textos em PT, EN e ES |
| Planilha de tags (CSV) | Quais chaves já existem no produto |

Os textos exibidos vêm sempre dos arquivos i18n, porque são eles que a tela usa. Da
planilha só se lê a coluna da chave.

## Layout

No topo: alternador **Tela atual · Todas**, campo de busca e filtro de status. Abaixo, a
tabela de tags e, depois dela, a seção de chaves dinâmicas.

- "Tela atual" (padrão) mostra as tags usadas pelos componentes da tela atual. "Todas"
  mostra as de todos os componentes da pasta das telas.
- A busca filtra por chave e por texto em qualquer idioma.
- O filtro de status tem as opções Todas · Novas · Existentes.

## Tabela de tags

Uma linha por chave.

| Coluna | Conteúdo |
|---|---|
| Chave | A chave completa, com botão de copiar |
| PT | Texto em português, ou `—` se a chave não existe no arquivo |
| EN | Texto em inglês, ou `—` |
| ES | Texto em espanhol, ou `—` |
| Status | **Existente** se a chave está na planilha; **Nova** se não está |
| Componente | Identificador do componente que usa a chave |
| Contexto | Papel do texto + elemento, e o trecho do código |

- Ordenação padrão: Novas primeiro, depois por chave. Clicar num cabeçalho reordena.
- Uma chave usada em mais de um lugar mostra o primeiro uso e um indicador "+2"; expandir a
  linha lista todos os usos, cada um com seu componente e contexto.
- Se o CSV da planilha não existir ou a coluna da chave não estiver configurada, a coluna
  Status mostra "sem planilha" em todas as linhas e um aviso explica como configurar.

## Contexto

O contexto responde "que texto é este na interface?". Tem três partes:

| Parte | Exemplo |
|---|---|
| Papel | "rótulo do botão" |
| Condição (se houver) | "aparece quando: `items.length === 0`" |
| Trecho | A linha do código onde a chave aparece, sem espaços nas pontas, até 160 caracteres |

### Papel, para chaves no template

| Onde a chave aparece | Papel |
|---|---|
| Texto dentro de `button` ou propriedade `label` de `p-button` | rótulo do botão |
| Texto dentro de `label` | rótulo de campo |
| Texto dentro de `h1` a `h6` | título |
| Texto dentro de `th`, ou propriedade `header` de coluna | cabeçalho de coluna |
| Texto dentro de `a` | link |
| Propriedade `placeholder` | placeholder do campo |
| Propriedade `pTooltip` ou `title` | tooltip |
| Propriedade `header` em outros elementos | título de `<elemento>` |
| Propriedade `aria-label` | rótulo acessível |
| Outra propriedade | propriedade `<nome>` de `<elemento>` |
| Outro texto | texto em `<elemento>` |

### Papel, para chaves no `.ts`

| Onde a chave aparece | Papel |
|---|---|
| Dentro de uma chamada que adiciona mensagem (`MessageService.add`) | mensagem de aviso (toast) |
| Dentro de uma chamada de confirmação (`ConfirmationService.confirm`) | diálogo de confirmação |
| Outra chamada ao serviço de tradução | texto montado no código, em `<método>` |

### Condição

Se a chave está dentro de um bloco condicional (`@if`, `@else`, `@empty`, `@case`,
`*ngIf`), o contexto inclui a expressão do bloco mais próximo, como está no código. Para
`@else` e `@empty`, use "senão de: `<expressão>`" e "lista vazia de: `<expressão>`".

## Chaves dinâmicas

Chaves que não são um texto fixo no código (ex.: `'status.' + item.status | translate`, ou
`col.header | translate`) não podem ser resolvidas pela leitura do código. Elas aparecem
numa seção separada, abaixo da tabela, com: a expressão original, o componente e o contexto.

**Uso provável.** Para reduzir o que escapa por causa de chaves dinâmicas, o gerador também
registra todo texto fixo de um `.ts` de componente que seja idêntico a uma chave existente
nos arquivos i18n. Esses usos entram na tabela principal com o papel "texto no código (uso
provável)".

## Estados da aba

| Situação | O que aparece |
|---|---|
| Nenhuma tag na tela atual | "Nenhuma tag de tradução encontrada nesta tela." + atalho para "Todas" |
| Sem planilha | Tabela normal, Status "sem planilha", aviso de configuração |
| Busca sem resultado | "Nenhuma tag corresponde à busca." |

## Critérios de aceite

1. Uma chave usada com o pipe de tradução num template aparece na tabela com os três
   textos, o componente e o contexto.
2. Uma chave que está na planilha aparece como Existente; uma que não está, como Nova.
3. Uma chave num `placeholder` tem o papel "placeholder do campo"; uma dentro de um `@if`
   mostra a condição.
4. Uma chave usada em dois componentes aparece numa linha só, com os dois usos ao expandir.
5. Uma chave montada por concatenação aparece na seção de chaves dinâmicas.
6. Com "Tela atual", só aparecem tags dos componentes da tela atual; "Todas" mostra o resto.
7. Adicionar uma tag a um template e salvar atualiza a tabela sem reiniciar nada.
