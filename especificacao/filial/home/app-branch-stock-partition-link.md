# app-branch-stock-partition-link

### Aplicação
Seção "Selecionar almoxarifado" da aba Almoxarifado. Lista os almoxarifados que ainda não estão
vinculados à filial, permite marcar um ou mais e vinculá-los de uma vez.

### Componentização
| Componente                        | Tipo    | Onde é usado                                                                 |
| --------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `app-branch-filter`               | Interno | Painel de filtro, quando aberto (`../lista/app-branch-filter.md`)            |
| `app-branch-stock-partition-card` | Interno | Variação Selecionável, um por almoxarifado da página (`app-branch-stock-partition-card.md`) |
| `p-button`                        | Externo | "Fechar", "Vincular", filtro, atualizar e "Tentar novamente"                 |
| `p-paginator`                     | Externo | Paginação                                                                    |

### Elementos

#### Título "Selecionar almoxarifado"
- **Tag:** `iclass.generic.label.select-stock-partition`
- **CSS:** `.t-title-sm` (globais) `.link-panel__title`; h2; nomeia a seção (`aria-labelledby`).

#### Botão "Fechar"
- **Tag:** `portal.generic.button.close`
- **Componente:** `p-button`
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar, fecha a seção sem vincular (ver Fluxo em `README.md`).
- **Regras:** desabilitado enquanto vincula.

#### Botão "Vincular (n)"
- **Tag:** `iclass.generic.button.link-count`, com a quantidade de almoxarifados marcados no lugar de `{0}`.
- **Componente:** `p-button`
- **CSS:** `btn--md btn--primary` (globais)
- **Comportamento:** ao clicar, vincula à filial todos os almoxarifados marcados. Sucesso: toast de sucesso `iclass.generic.label.stock-partition-s-linked-successfully` (4 segundos) e a seção avisa a aba (ver Fluxo). Falha: toast de erro `iclass.generic.label.could-not-link-the-stock-partition` (6 segundos) e a seção continua aberta com a seleção.
- **Regras:** desabilitado sem almoxarifado marcado; mostra o indicador de carregamento enquanto vincula.

#### Botão de filtro
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button`
- **Ícone:** `pi pi-filter`
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar, abre ou fecha o painel de filtro.
- **Regras:** com o painel aberto, fica destacado (`is-active`, globais).

#### Botão de atualizar
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button`
- **Ícone:** `pi pi-refresh`
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar, recarrega os almoxarifados disponíveis aplicando o filtro preenchido no painel e volta à página 1.
- **Regras:** desabilitado durante a carga.

#### Lista de almoxarifados disponíveis
- **Componente:** `app-branch-stock-partition-card`, variação Selecionável, um por almoxarifado da página
- **CSS:** `.list-stack` (globais)
- **Regras:** só almoxarifados do sistema que ainda não estão vinculados à filial; ordem fixa por Descrição, crescente. A marcação vale por almoxarifado e continua ao trocar de página ou filtrar; ao recarregar, desmarca os que deixaram de estar disponíveis.
- **Origem do dado:** --

#### Paginador
- **Componente:** `p-paginator`
- **CSS:** `paginator--md` (globais); dentro da seção ganha borda superior e respiro (`.insumo-layer .p-paginator`, globais).
- **Comportamento:** ao trocar de página, mostra os almoxarifados da página escolhida.
- **Regras:** 5 itens por página; até 5 números de página; só aparece com mais de 5 resultados; volta à página 1 ao atualizar.

### Layout
Uma caixa azul-clara com borda e cantos de 10px (`.insumo-layer` com `.link-panel`), em coluna
com 12px entre os blocos:

1. **Cabeçalho:** título à esquerda; "Fechar" e "Vincular (n)" à direita, com 8px entre eles.
2. **Ferramentas (alinhadas à direita, 8px entre elas):** filtro e atualizar.
3. **Painel de filtro**, quando aberto.
4. **Lista** ou estado.
5. **Paginador**, quando aparece.

### Estados
| Estado               | Quando                                                     | O que deve ser exibido                                                                                                         |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Carregando           | Ao abrir a seção e ao atualizar                             | 3 cards em skeleton; `aria-busy`; atualizar desabilitado                                                                        |
| Com resultados       | Há almoxarifado disponível após o filtro                    | Cards da página e paginador (se houver mais de 5)                                                                               |
| Vazio (todos vinculados) | Não sobrou almoxarifado para vincular                   | Ícone `pi pi-folder-open` e `iclass.generic.label.all-stock-partitions-linked` (`.load-state`, globais)                          |
| Sem resultado        | Há disponíveis, há filtro ativo e nenhum atende             | Ícone `pi pi-search` e `portal.generic.results-not-found`                                                                       |
| Erro                 | A busca falhou                                              | Ícone `pi pi-exclamation-circle` em vermelho, `iclass.generic.label.could-not-load-stock-partitions` e o botão `portal.generic.button.try-again` (`btn--md btn--secondary`, ícone `pi pi-refresh`), que recarrega |
| Vinculando           | O usuário clicou em "Vincular (n)"                          | "Vincular (n)" com indicador de carregamento e "Fechar" desabilitado                                                            |

### Comportamentos
- **Dado** a seção aberta, **quando** o usuário altera o filtro no painel, **então** a lista só
  muda ao clicar no botão de atualizar.

### CSS
| Classe              | Definição                                                         |
| ------------------- | ----------------------------------------------------------------- |
| .link-panel         | background: #F6FAFF;<br>border-color: #C6DFFF;                    |
| .link-panel__header | display: flex;<br>align-items: center;<br>gap: 12px;              |
| .link-panel__title  | margin: 0;<br>color: #1F2937;                                     |
| .link-panel__actions | display: flex;<br>gap: 8px;<br>margin-left: auto;                |
| .link-panel__tools  | display: flex;<br>justify-content: flex-end;<br>gap: 8px;         |

Usa também `.insumo-layer`, `.t-title-sm`, `.list-stack`, `.load-state`, `.load-state--error`,
`.is-active` e `.paginator--md` (globais).
