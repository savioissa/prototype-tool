# app-branch-repository-picker

### Aplicação
Campo obrigatório "Repositório" da tela de adicionar repositório. Permite escolher um
repositório do sistema, de um tipo escolhido pelo usuário, trocar a escolha ou desfazê-la.
Funciona como `app-branch-stock-partition-picker.md`; este arquivo descreve só o que é
diferente.

### Componentização
| Componente                     | Tipo    | Onde é usado                                                                                   |
| ------------------------------ | ------- | ---------------------------------------------------------------------------------------------- |
| `app-branch-repository-filter` | Interno | Painel de filtro da seleção, variação Tipo fixo, quando aberto (`app-branch-repository-filter.md`) |
| `app-branch-repository-card`   | Interno | Variação Escolha: um por repositório da página; variação Simples: o escolhido (`app-branch-repository-card.md`) |
| `p-dropdown`                   | Externo | Tipo repositório                                                                               |
| `p-button`                     | Externo | "Alterar", "Remover", filtro, atualizar e "Fechar"                                             |
| `p-paginator`                  | Externo | Paginação da seleção                                                                           |

### Elementos

#### Rótulo "Repositório"
- **Tag:** `iclass.generic.label.repository`, seguido de um asterisco vermelho (`aria-hidden`).
- **CSS:** `.t-label-field` (globais) `.pick-field__label`; asterisco `.pick-field__required`; h3.

#### Divisor
- **CSS:** `.pick-field__type-divider`; traço vertical de 1px × 16px.
- **Regras:** só com a seleção aberta, entre o rótulo e o rótulo "Tipo repositório".

#### Rótulo "Tipo repositório"
- **Tag:** `iclass.generic.label.repository-type`
- **CSS:** `.pick-field__type-label`
- **Regras:** só com a seleção aberta; associado ao campo de tipo.

#### Campo de tipo
- **Tag:** opções `portal.generic.label.team`, `third.party`, `iclass.generic.label.warehouse`, `portal.generic.label.workshop`, `iclass.generic.label.cluster`, nesta ordem.
- **Componente:** `p-dropdown`, com a lista aberta no `body`.
- **CSS:** `pick-field__type-select`; 28px de altura, largura mínima de 140px.
- **Comportamento:** ao trocar o tipo, limpa o filtro da seleção e carrega os repositórios do tipo novo.
- **Regras:** só com a seleção aberta, logo à direita do rótulo; começa em Equipe e mantém o último tipo escolhido enquanto a tela estiver aberta.

#### Botões "Alterar" e "Remover"
- **Regras:** iguais aos de `app-branch-stock-partition-picker.md`; só aparecem com um repositório escolhido e a seleção fechada.

#### Área clicável "Selecionar repositório"
- **Tag:** `iclass.generic.label.select-repository`
- **Ícone:** `pi pi-plus`
- **CSS:** `.pick-area`
- **Comportamento:** ao clicar, abre a seleção no lugar da área.
- **Regras:** só aparece sem escolha e com a seleção fechada.

#### Card do repositório escolhido
- **Componente:** `app-branch-repository-card`, variação Simples
- **Regras:** só aparece com um repositório escolhido e a seleção fechada.

#### Título da seleção
- **Tag:** `iclass.generic.label.select-repository`
- **CSS:** `.pick-section__title`; h4.

#### Botões de filtro e de atualizar
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Regras:** iguais aos de `app-branch-stock-partition-picker.md`; o atualizar recarrega os repositórios do tipo escolhido.

#### Lista de repositórios
- **Componente:** `app-branch-repository-card`, variação Escolha, um por repositório da página
- **CSS:** `.list-stack` (globais)
- **Regras:** mostra os repositórios do sistema do tipo escolhido; ordem fixa pelo nome (Técnico na Equipe, Descrição no Armazém e na Oficina, Nome na Credenciada e no Cluster), crescente.
- **Origem do dado:** --

#### Botão "Fechar" e paginador
- **Regras:** iguais aos de `app-branch-stock-partition-picker.md` (3 itens por página).

### Layout
Igual ao de `app-branch-stock-partition-picker.md`. Com a seleção aberta, o cabeçalho do campo
traz, à direita do rótulo, o divisor, o rótulo "Tipo repositório" e o campo de tipo, com 8px
entre eles.

### Estados
| Estado               | Quando                                                      | O que deve ser exibido                                                                                       |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Sem escolha          | Ao abrir a tela de adicionar repositório                     | Área clicável (a seleção começa fechada)                                                                     |
| Seleção aberta       | Ao clicar na área, em "Alterar", ou ao escolher o almoxarifado sem repositório escolhido | Tipo no cabeçalho e a caixa da seleção                                          |
| Carregando           | Os repositórios do tipo estão sendo buscados                 | 3 cards em skeleton; `aria-busy`; atualizar desabilitado                                                      |
| Com resultados       | Há repositório do tipo após o filtro                         | Cards da página e paginador (se houver mais de 3)                                                            |
| Vazio (sem cadastro) | Nenhum repositório do tipo no sistema                        | Ícone `pi pi-folder-open` e `iclass.generic.label.no-repository-of-type-registered`                          |
| Sem resultado        | Há repositórios do tipo, há filtro ativo e nenhum atende     | Ícone `pi pi-search` e `portal.generic.results-not-found`                                                    |
| Erro                 | A busca falhou                                               | Ícone `pi pi-exclamation-circle` em vermelho, `iclass.generic.label.could-not-load-repositories` e o botão `portal.generic.button.try-again`, que recarrega |
| Escolhido            | Seleção fechada, repositório escolhido                       | "Alterar", "Remover" e o card do repositório                                                                 |

### Comportamentos
- **Dado** a seleção fechada pela primeira vez, **quando** ela é aberta, **então** os repositórios
  do tipo são buscados; nas aberturas seguintes, a lista já carregada é mantida.
- **Dado** uma busca em andamento, **quando** o usuário troca o tipo, **então** a resposta do
  tipo anterior é descartada.

### CSS
Usa as classes de `app-branch-stock-partition-picker.md` (a casca usa o mesmo arquivo de
estilo) e, além delas:

| Classe                     | Definição                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| .pick-field__type          | display: flex;<br>align-items: center;<br>gap: 8px;                                                        |
| .pick-field__type-divider  | width: 1px;<br>height: 16px;<br>margin: 0 4px;<br>background: #D1D5DB;                                     |
| .pick-field__type-label    | font: var(--secondary-md);<br>color: #6B7280;<br>white-space: nowrap;                                       |
| .pick-field__type-select.p-dropdown | min-width: 140px;<br>height: 28px;<br>align-items: center;<br>border-color: #D9DCE1;<br>border-radius: 6px;<br>background: #FFFFFF; |
| .pick-field__type-select.p-dropdown:not(.p-disabled):hover | border-color: #C2C6CE;                                              |
| .pick-field__type-select .p-dropdown-label | padding: 0 10px;<br>font: var(--secondary-md);<br>color: #1F2937;                                  |
| .pick-field__type-select .p-dropdown-trigger | width: 30px;<br>color: #6B7280;                                                                  |
| .pick-field__type-select .p-dropdown-trigger .p-icon | width: 12px;<br>height: 12px;                                                            |
