# app-branch-sort

### Aplicação
Painel onde o usuário escolhe por qual campo e em que direção um resultado de registros com
código e descrição é ordenado. É usado na lista de filiais e na aba Almoxarifado da home.

### Componentização
| Componente   | Tipo    | Onde é usado            |
| ------------ | ------- | ----------------------- |
| `p-dropdown` | Externo | Campo de ordenação      |
| `p-button`   | Externo | Botão de direção        |

### Elementos

#### Rótulo "Ordenar por"
- **Tag:** `portal.generic.label.sort-by`
- **CSS:** `.sort-panel__label` (globais)

#### Campo de ordenação
- **Tag:** placeholder `portal.generic.label.select`; opções `iclass.generic.label.code` e `iclass.generic.label.description`, nesta ordem.
- **Componente:** `p-dropdown`, com botão de limpar e a lista aberta no `body`.
- **CSS:** `sort-panel__select`; lista `sort-panel__select-panel` (globais); ocupa a largura do painel ao lado do botão de direção.
- **Comportamento:** ao escolher um campo, o resultado é reordenado na hora; ao limpar, a ordenação é desfeita e o resultado volta à ordem de chegada dos dados.
- **Regras:** valor inicial depende de onde o painel é usado: na lista de filiais e na aba Almoxarifado, Descrição (crescente). A comparação usa a ordem alfabética do português, sem diferenciar maiúsculas nem acentos.

#### Botão de direção
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button`
- **Ícone:** `pi pi-sort-amount-up-alt` na direção crescente; `pi pi-sort-amount-down` na decrescente.
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar, inverte a direção e o resultado é reordenado na hora.
- **Regras:** começa em crescente; desabilitado enquanto nenhum campo estiver escolhido. Ao trocar de campo, a direção atual é mantida.

### Layout
O painel é uma coluna com 4px entre as linhas:

1. **Linha 1:** rótulo "Ordenar por".
2. **Linha 2:** campo de ordenação (ocupa o espaço restante) e botão de direção à direita, com 6px entre eles.

Largura máxima de 360px. Fundo cinza, borda e cantos de 4px (`.sort-panel`, globais).

### Estados
| Estado         | Quando                                       | O que deve ser exibido                                                        |
| -------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| Fechado        | O botão de ordenação do contêiner não está ativo | O painel não aparece                                                      |
| Sem ordenação  | Nenhum campo escolhido                       | Placeholder "Selecione" e botão de direção desabilitado (opacidade 0,5)        |
| Com ordenação  | Um campo escolhido                           | Nome do campo, botão de limpar no campo e botão de direção com o ícone da direção atual |

### Comportamentos
- **Dado** o painel fechado e aberto de novo, **quando** reaparece, **então** mostra o campo e a
  direção em vigor; fechar o painel não desfaz a ordenação.

### CSS
| Classe | Definição                         |
| ------ | --------------------------------- |
| :host  | display: block;<br>max-width: 360px; |

O painel usa também `.sort-panel`, `.sort-panel__label`, `.sort-panel__control`,
`.sort-panel__field`, `.sort-panel__select` e `.sort-panel__select-panel` (globais).
