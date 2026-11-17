# app-branch-repository-sort

### Aplicação
Painel onde o usuário escolhe a ordenação da lista de repositórios da aba Repositório. Tem a
mesma aparência e o mesmo funcionamento de `../lista/app-branch-sort.md`; muda só a lista de
campos e a regra de ordenação.

### Componentização
| Componente   | Tipo    | Onde é usado       |
| ------------ | ------- | ------------------ |
| `p-dropdown` | Externo | Campo de ordenação |
| `p-button`   | Externo | Botão de direção   |

### Elementos

#### Rótulo "Ordenar por"
- **Tag:** `portal.generic.label.sort-by`
- **CSS:** `.sort-panel__label` (globais)

#### Campo de ordenação
- **Tag:** placeholder `portal.generic.label.select`; opções, nesta ordem: `iclass.generic.label.repository-type` e os dois campos de cada tipo, com as mesmas tags e a mesma ordem do filtro (ver `app-branch-repository-filter.md`).
- **Componente:** `p-dropdown`, com botão de limpar e a lista aberta no `body`.
- **CSS:** `sort-panel__select`; lista `sort-panel__select-panel` (globais)
- **Comportamento:** ao escolher um campo, a lista é reordenada na hora; ao limpar, volta à ordem de chegada dos dados.
- **Regras:** começa em Tipo repositório. Por Tipo repositório, ordena pelo nome do tipo como aparece na tela, no idioma da interface. Por um campo de um tipo (ex.: Descrição do armazém), os repositórios desse tipo vêm primeiro, ordenados pelo campo na direção escolhida, e os demais vêm depois, por tipo crescente.

#### Botão de direção
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button`
- **Ícone:** `pi pi-sort-amount-up-alt` na direção crescente; `pi pi-sort-amount-down` na decrescente.
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar, inverte a direção e reordena na hora.
- **Regras:** começa em crescente; desabilitado sem campo escolhido.

### Layout
Igual ao de `../lista/app-branch-sort.md`.

### Estados
| Estado        | Quando                                            | O que deve ser exibido                                              |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| Fechado       | O botão de ordenação da aba não está ativo         | O painel não aparece                                                |
| Sem ordenação | O usuário limpou o campo                           | Placeholder "Selecione" e botão de direção desabilitado             |
| Com ordenação | Um campo escolhido (padrão: Tipo repositório)      | Nome do campo, botão de limpar e botão de direção habilitado        |

### Comportamentos
— (não se aplica)

### CSS
Mesmas classes de `../lista/app-branch-sort.md` (a casca usa o mesmo arquivo de estilo).
