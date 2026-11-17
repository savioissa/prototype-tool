# app-branch-list

### Aplicação
Contêiner da página de lista de filiais. Organiza o cabeçalho, os painéis de filtro e de
ordenação, os cards e o paginador, e controla qual resultado é exibido.

### Componentização
| Componente          | Tipo    | Onde é usado                                                       |
| ------------------- | ------- | ------------------------------------------------------------------ |
| `app-branch-filter` | Interno | Painel de filtro, quando aberto (`app-branch-filter.md`)           |
| `app-branch-sort`   | Interno | Painel de ordenação, quando aberto (`app-branch-sort.md`)          |
| `app-branch-card`   | Interno | Um por filial da página atual; 7 em skeleton na carga (`app-branch-card.md`) |
| `p-button`          | Externo | Botões do cabeçalho e "Tentar novamente"                           |
| `p-paginator`       | Externo | Paginação do resultado                                             |
| `p-toast`           | Externo | Aviso de erro ao abrir uma filial (toast global da aplicação, no topo à direita) |

### Elementos

#### Título da página
- **Tag:** `branch`
- **CSS:** `.t-title-lg` (globais) `.page-header__title` (globais); h1; peso 500.

#### Botão "Novo"
- **Tag:** `portal.generic.label.new`
- **Componente:** `p-button`
- **Ícone:** `pi pi-plus`
- **CSS:** `btn--md btn--secondary header-btn` (globais)
- **Comportamento:** ao clicar, vai para a página de criação (`/filial/nova`).

#### Botão de filtro
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button`
- **Ícone:** `pi pi-filter`
- **CSS:** `btn--md btn--neutral header-btn` (globais)
- **Comportamento:** ao clicar, abre ou fecha o painel de filtro.
- **Regras:** fica destacado (`is-active`, globais) só enquanto o painel está aberto; com o painel fechado, não indica filtro aplicado.

#### Botão de ordenação
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button`
- **Ícone:** `pi pi-sort-amount-down`
- **CSS:** `btn--md btn--neutral header-btn` (globais)
- **Comportamento:** ao clicar, abre ou fecha o painel de ordenação.
- **Regras:** fica destacado (`is-active`) só enquanto o painel está aberto.

#### Botão "Atualizar"
- **Tag:** `portal.generic.button.refresh`
- **Componente:** `p-button`
- **Ícone:** `pi pi-refresh`
- **CSS:** `btn--md btn--primary header-btn` (globais)
- **Comportamento:** ao clicar, recarrega a lista aplicando o filtro preenchido no painel, mantém a ordenação e volta à página 1.
- **Regras:** desabilitado durante a carga.

#### Coluna de cards
- **Componente:** `app-branch-card`, um por filial da página atual
- **CSS:** `.list-stack` (globais); 10px entre cards.
- **Regras:** ordenação padrão por Descrição, crescente; campos e direção estão em `app-branch-sort.md`.
- **Origem do dado:** --

#### Paginador
- **Componente:** `p-paginator`
- **CSS:** `paginator--md` (globais); alinhado à direita, botões de 32px.
- **Comportamento:** ao trocar de página, mostra os cards da página escolhida.
- **Regras:** 7 itens por página; até 5 números de página, com primeira, anterior, próxima e última; só aparece com mais de 7 resultados, como nas abas da home; volta à página 1 ao ordenar e ao atualizar; o total é a quantidade de filiais após o filtro.

#### Botão "Tentar novamente"
- **Tag:** `portal.generic.button.try-again`
- **Componente:** `p-button`
- **Ícone:** `pi pi-refresh`
- **CSS:** `btn--md btn--secondary` (globais)
- **Comportamento:** ao clicar, recarrega a lista.
- **Regras:** só aparece no estado Erro.

#### Aviso de erro ao abrir
- **Tag:** `iclass.generic.label.could-not-load-branch`
- **Componente:** `p-toast` (gravidade erro)
- **Regras:** aparece por 6 segundos quando a filial escolhida não é encontrada ou a conferência falha (ver Fluxo em `README.md`).

### Layout
A página é uma coluna com altura mínima da tela, dividida em duas seções:

1. **Cabeçalho (topo, preso ao rolar):** título à esquerda; "Novo", filtro, ordenação e "Atualizar" à direita, com 10px entre eles.
2. **Conteúdo (largura toda, 16px entre blocos):** painel de filtro, painel de ordenação, coluna de cards e paginador, nesta ordem.

O cabeçalho e o conteúdo têm 32px de margem lateral (16px em telas de até 700px).

### Estados
| Estado                     | Quando                                                            | O que deve ser exibido                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Carregando                 | Ao abrir a página e durante o "Atualizar"                         | 7 cards em skeleton e um skeleton de 300px × 32px no lugar do paginador (`.skeleton-paginator`, globais); `aria-busy`; "Atualizar" desabilitado |
| Com resultados             | Carga concluída e ao menos uma filial após o filtro               | Cards da página atual e paginador (se houver mais de 7)                                                                                                              |
| Vazio (sem cadastro)       | Nenhuma filial cadastrada (ou nenhuma, sem filtro com valor)      | Ícone `pi pi-folder-open` e `iclass.generic.label.no-branch-registered`, centralizados no espaço restante (`.req-empty .state-fill`, globais)    |
| Sem resultado (com filtro) | Existe filial, há filtro aplicado com valor e nenhuma atende      | Ícone `pi pi-search` e `portal.generic.results-not-found`, centralizados                                                                       |
| Erro                       | A carga falhou                                                    | Ícone `pi pi-exclamation-circle` em vermelho, `iclass.generic.label.could-not-load-branches` e o botão "Tentar novamente" (`.load-state--error .state-fill`, globais) |

### Comportamentos
- **Dado** qualquer estado, **quando** o usuário abre os dois painéis, **então** os dois ficam
  abertos ao mesmo tempo, com o filtro acima da ordenação; fechar um painel não limpa o que foi
  escolhido nele.

### CSS
| Classe | Definição                                                     |
| ------ | ------------------------------------------------------------- |
| :host  | display: flex;<br>flex-direction: column;<br>min-height: 100vh; |

Usa também `.page-header`, `.page-header__title`, `.page-header__actions`, `.page-content`,
`.t-title-lg`, `.list-stack`, `.skeleton`, `.skeleton-paginator`, `.req-empty`, `.load-state`,
`.load-state--error`, `.state-fill`, `.is-active` e `.paginator--md` (globais).
