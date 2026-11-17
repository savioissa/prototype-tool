# app-branch-repository-filter

### Aplicação
Painel onde o usuário restringe uma lista de repositórios. Tem o campo Tipo repositório
(seleção múltipla) e, para cada tipo, os dois campos que identificam o repositório, cada um com
operador e valor. Na escolha de repositório, o tipo já vem definido e o painel mostra só os dois
campos desse tipo.

### Componentização
| Componente      | Tipo    | Onde é usado                         |
| --------------- | ------- | ------------------------------------ |
| `p-multiSelect` | Externo | Campo Tipo repositório               |
| `p-dropdown`    | Externo | Operador de cada campo               |
| `pInputText`    | Externo | Valor de cada campo                  |

O painel tem duas variações:

| Variação   | Onde                                              | Campos                                           |
| ---------- | ------------------------------------------------- | ------------------------------------------------ |
| Completa   | Aba Repositório (`app-branch-repositories`)        | Tipo repositório + 10 campos (2 por tipo)        |
| Tipo fixo  | Escolha de repositório (`app-branch-repository-picker`) | Só os 2 campos do tipo escolhido           |

Campos por tipo, na ordem do painel (os mesmos campos do card, ver `app-branch-repository-card.md`):

| Ordem | Tipo        | 1º campo                                       | 2º campo                                            |
| ----- | ----------- | ---------------------------------------------- | --------------------------------------------------- |
| 1     | Armazém     | `iclass.generic.label.warehouse-code`          | `iclass.generic.label.warehouse-description`        |
| 2     | Credenciada | `iclass.generic.label.third-party-code`        | `iclass.generic.label.third-party-description`      |
| 3     | Equipe      | `iclass.generic.label.team-login`              | `iclass.generic.label.team-name`                    |
| 4     | Oficina     | `iclass.generic.label.workshop-description`    | `iclass.generic.label.workshop-third-party`         |
| 5     | Cluster     | `iclass.generic.label.cluster-regional`        | `iclass.generic.label.cluster-name`                 |

### Elementos

#### Rótulo "Tipo repositório"
- **Tag:** `iclass.generic.label.repository-type`
- **CSS:** `.filter-panel__label` (globais); maiúsculas.
- **Regras:** só na variação Completa.

#### Campo Tipo repositório
- **Tag:** placeholder `portal.technical.sheet.label.all`; opções `portal.generic.label.team`, `third.party`, `iclass.generic.label.warehouse`, `portal.generic.label.workshop`, `iclass.generic.label.cluster`, nesta ordem.
- **Componente:** `p-multiSelect`, sem cabeçalho (sem "marcar todos" nem busca), com a lista aberta no `body`.
- **CSS:** `filter-panel__multi`; lista `filter-panel__multi-panel` (globais)
- **Comportamento:** ao marcar ou desmarcar um tipo, guarda no filtro em edição, sem aplicar; os campos dos tipos não marcados ficam desabilitados na hora.
- **Regras:** só na variação Completa; começa sem tipo marcado, mostrando "Todos"; nenhum tipo marcado vale como todos os tipos.

#### Rótulo de cada campo
- **Tag:** conforme o tipo e o campo (tabela acima)
- **CSS:** `.filter-panel__label` (globais); maiúsculas. Campo desabilitado: `.filter-panel__field--disabled` (globais), rótulo em cinza claro.

#### Operador de cada campo
- **Tag:** placeholder `iclass.generic.label.select-operator`; opções `iclass.generic.label.equals`, `iclass.generic.label.different`, `iclass.generic.label.contains`, `iclass.generic.label.starts-with`, `iclass.generic.label.ends-with`.
- **Componente:** `p-dropdown`, com a lista aberta no `body`.
- **CSS:** `filter-panel__operator`; lista `filter-panel__operator-panel` (globais)
- **Comportamento:** ao escolher, guarda no filtro em edição, sem aplicar.
- **Regras:** começa em "Contém" em todos os campos. Desabilitado quando o tipo do campo não está marcado em Tipo repositório.

#### Valor de cada campo
- **Componente:** `pInputText`
- **CSS:** `.filter-panel__input` (globais)
- **Comportamento:** ao digitar, guarda no filtro em edição, sem aplicar.
- **Regras:** começa vazio; desabilitado quando o tipo do campo não está marcado em Tipo repositório.

### Layout
Grade de quatro colunas de mesma largura, com 16px entre elas, preenchida em ordem: Tipo
repositório e depois os campos de cada tipo na ordem da tabela (linhas de 4, 4 e 3 campos). Na
variação Tipo fixo, só os dois campos do tipo, na primeira linha.

Em telas de até 1100px, duas colunas; até 700px, uma coluna. Fundo, borda e cantos do
`.filter-panel` (globais).

### Estados
| Estado           | Quando                                            | O que deve ser exibido                                                                                   |
| ---------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Fechado          | O botão de filtro do contêiner não está ativo      | O painel não aparece                                                                                     |
| Aberto           | O usuário ligou o botão de filtro do contêiner     | Todos os campos da variação, com os valores em edição                                                    |
| Tipos escolhidos | Algum tipo marcado em Tipo repositório             | Campos dos tipos não marcados desabilitados, com rótulo em cinza claro                                    |
| Com filtro ativo | Um filtro com tipo ou valor foi aplicado          | Painel aberto: os valores aplicados. Painel fechado: nenhuma indicação; a lista continua filtrada          |

### Comportamentos
- **Dado** um filtro aplicado, **quando** a lista é filtrada, **então**:
  - Tipo repositório deixa passar só os tipos marcados (nenhum marcado = todos);
  - os dois campos de um tipo valem para os repositórios desse tipo e se somam (E);
  - com algum campo preenchido, só aparecem os tipos que têm campo preenchido, e entre tipos
    diferentes vale qualquer um (OU). Ex.: Código do armazém = ARM01 e Login da equipe = jsilva
    mostra ARM01 e jsilva;
  - campo de tipo desmarcado em Tipo repositório é ignorado;
  - a comparação segue as mesmas regras de `../lista/app-branch-filter.md` (sem diferenciar
    maiúsculas e acentos, valor vazio não restringe).
- **Dado** o painel fechado e aberto de novo, **quando** reaparece, **então** mostra os valores
  em edição de antes.

### CSS
| Classe                   | Definição                                          |
| ------------------------ | -------------------------------------------------- |
| .repo-filter (até 1100px) | grid-template-columns: repeat(2, minmax(0, 1fr)); |
| .repo-filter (até 700px)  | grid-template-columns: minmax(0, 1fr);            |

Usa também `.filter-panel`, `.filter-panel__field`, `.filter-panel__field--disabled`,
`.filter-panel__label`, `.filter-panel__control`, `.filter-panel__input`,
`.filter-panel__operator`, `.filter-panel__operator-panel`, `.filter-panel__multi` e
`.filter-panel__multi-panel` (globais).
