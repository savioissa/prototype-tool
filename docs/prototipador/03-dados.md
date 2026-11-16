# 03 — Dados

## Propósito

Mostrar, num diagrama de caixas e linhas, as entidades do protótipo, seus atributos e seus
relacionamentos. O schema não é escrito por ninguém: é **inferido dos dados mockados**.

Como é inferência, o diagrama mostra o que os mocks permitem concluir, não a verdade do
banco. A interface deixa isso visível (ver "Confiança").

## Escopo

Todas as entidades encontradas nos mocks do projeto, não só as da tela atual.

## De onde vêm as entidades

O gerador carrega cada arquivo que bate com o padrão `mocks` da configuração e olha os
exports:

| Export | Vira |
|---|---|
| Lista não vazia de objetos | Uma entidade, com um registro por item |
| Um objeto | Uma entidade, com um registro |
| Qualquer outra coisa | Ignorado |

**Nome da entidade:** se o export tem anotação de tipo (`Branch[]` ou `Branch`), usa o nome
do tipo. Sem anotação, usa o nome do export sem os sufixos `Mock`, `Mocks`, `_MOCK` e
`_MOCKS`, em PascalCase.

Duas entidades com o mesmo nome são unidas: os registros das duas contam para a inferência.

## Atributos

Para cada chave presente em pelo menos um registro da entidade:

| Informação | Regra |
|---|---|
| Nome | A chave |
| Tipo | Os tipos observados nos valores: `texto`, `numero`, `booleano`, `data`. Mais de um tipo observado aparece como união (`texto \| numero`) |
| Opcional | Sim, se a chave falta, é nula ou indefinida em pelo menos um registro |
| Exemplo | O primeiro valor não nulo, cortado em 40 caracteres |
| Marca | `PK` para a chave `id`; `FK` para chaves que geram relacionamento por referência |

`data` é um valor `Date` ou um texto em formato ISO 8601. Atributos cujo valor é objeto ou
lista de objetos não aparecem como atributo: viram relacionamento.

## Relacionamentos

| Regra | Condição | Resultado | Rótulo da linha |
|---|---|---|---|
| Aninhado | O atributo é um objeto | 1:1 com a entidade aninhada | `aninhado` |
| Lista aninhada | O atributo é uma lista de objetos | 1:N com a entidade aninhada | `lista aninhada` |
| Referência | O atributo se chama `<x>Id`, `<x>_id` ou `id<X>` e `<x>` é o nome de uma entidade (sem diferenciar maiúsculas) | N:1 com essa entidade | `campo <nome>` |
| Lista de referências | O atributo se chama `<x>Ids` ou `<x>_ids`, é lista de valores simples e `<x>` é o nome de uma entidade | N:N com essa entidade | `campo <nome>` |

**Entidade aninhada.** Se os atributos do objeto aninhado coincidem em pelo menos 80% com
os de uma entidade já existente, é essa entidade. Caso contrário, cria uma entidade nova
chamada `<Pai>.<atributo>` (ex.: `Branch.address`).

### Confiança

| Confiança | Quando | Linha |
|---|---|---|
| Alta | Aninhado e lista aninhada; referência em que todos os valores não nulos existem como `id` na entidade de destino | Contínua |
| Baixa | Referência em que algum valor não existe no destino, ou em que o destino não tem `id` | Tracejada |

Cada relacionamento guarda a regra que o gerou e a confiança.

## Diagrama

- Uma caixa por entidade: nome no topo e uma linha por atributo, com tipo, nome, marca
  (`PK`/`FK`) e, como comentário, "opcional" e o exemplo.
- Uma linha por relacionamento, com a cardinalidade nas pontas e o rótulo da regra.
- Zoom (roda do mouse e botões + / −), arraste para mover e um botão "Ajustar à tela".
- Legenda fixa no canto: "linha contínua: relacionamento confirmado pelos dados · linha
  tracejada: relacionamento provável".
- Somente leitura. Clicar numa caixa não faz nada.

**Implementação recomendada:** Mermaid, diagrama `erDiagram`, carregado sob demanda só
nesta aba. Monte o texto do diagrama a partir do schema gerado. Antes de escrever, confira
na documentação da versão instalada: a sintaxe de comentário de atributo, de apelido de
entidade (necessário para nomes com ponto) e de relacionamento não identificador
(tracejado). Se alguma dessas três coisas não existir na versão instalada, pare e relate.

## Estados da aba

| Situação | O que aparece |
|---|---|
| Nenhum mock encontrado | "Nenhum dado mockado encontrado." + o padrão de arquivos configurado em `mocks` |
| Mocks encontrados, nenhum relacionamento | O diagrama só com as caixas |
| Arquivo de mock que não pôde ser carregado | O diagrama com o que foi possível + o arquivo listado no painel "Avisos" |

## Critérios de aceite

1. Um mock com uma lista de objetos aparece como uma caixa com um atributo por chave.
2. Uma chave que falta em um dos registros aparece como opcional.
3. Um objeto aninhado e uma lista de objetos aninhada geram as linhas 1:1 e 1:N.
4. Um atributo `branchId` cujos valores existem nos `id` de `Branch` gera uma linha N:1
   contínua; trocar um dos valores por um `id` inexistente torna a linha tracejada.
5. Adicionar um atributo a um mock e salvar atualiza o diagrama sem reiniciar nada.
6. Um arquivo de mock com erro não impede as outras entidades de aparecerem.
