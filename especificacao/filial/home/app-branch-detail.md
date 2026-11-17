# app-branch-detail

### Aplicação
Contêiner da home da filial. Organiza o breadcrumb, a lateral com o resumo da filial e as abas
Cadastro, Almoxarifado e Repositório, e controla a carga da filial aberta.

### Componentização
| Componente                    | Tipo    | Onde é usado                                                              |
| ----------------------------- | ------- | ------------------------------------------------------------------------- |
| `app-branch-sidebar`          | Interno | Lateral, sempre (`app-branch-sidebar.md`)                                 |
| `app-branch-register`         | Interno | Aba Cadastro (`app-branch-register.md`)                                   |
| `app-branch-stock-partitions` | Interno | Aba Almoxarifado, a partir da primeira vez que é aberta (`app-branch-stock-partitions.md`) |
| `app-branch-repositories`     | Interno | Aba Repositório, a partir da primeira vez que é aberta (`app-branch-repositories.md`) |
| `p-breadcrumb`                | Externo | Breadcrumb no topo                                                        |
| `p-tabView` / `p-tabPanel`    | Externo | Abas                                                                      |
| `p-toast`                     | Externo | Aviso de erro ao carregar (toast global da aplicação)                     |

### Elementos

#### Breadcrumb
- **Tag:** `portal.generic.label.list` (primeiro item) e `iclass.generic.label.branch-page` (item atual).
- **Componente:** `p-breadcrumb`, separador "&gt;"
- **CSS:** `.branch-breadcrumb`, `.branch-breadcrumb__nav`; 12px; "Lista" em azul `#3B82F6`, sublinhado ao passar o mouse; item atual e separador em cinza.
- **Comportamento:** ao clicar em "Lista", volta para a lista de filiais (`/filial`).
- **Regras:** o item atual não é link.

#### Lateral
- **Componente:** `app-branch-sidebar`
- **Regras:** em skeleton enquanto a filial carrega.

#### Aba "Cadastro"
- **Tag:** `portal.generic.label.register`
- **Componente:** `p-tabPanel` com `app-branch-register`
- **CSS:** `req-tabs` (globais)
- **Regras:** aba aberta por padrão.

#### Aba "Almoxarifado"
- **Tag:** `iclass.generic.label.stock-partition`
- **Componente:** `p-tabPanel` com `app-branch-stock-partitions`
- **Regras:** o conteúdo só é criado quando a aba é aberta pela primeira vez e é mantido ao trocar de aba.

#### Aba "Repositório"
- **Tag:** `iclass.generic.label.repository`
- **Componente:** `p-tabPanel` com `app-branch-repositories`
- **Regras:** igual à aba Almoxarifado.

#### Aviso de erro ao carregar
- **Tag:** `iclass.generic.label.could-not-load-branch`
- **Componente:** `p-toast` (gravidade erro)
- **Regras:** aparece por 6 segundos quando a filial da URL não existe ou a busca falha; a página volta para a lista, sem deixar a URL da filial no histórico do navegador.

### Layout
Grade de 10 colunas com 16px de espaço e 16px de margem, com altura mínima da tela:

1. **Linha 1 (todas as colunas):** breadcrumb.
2. **Linha 2:** lateral em 2 colunas, à esquerda, com a altura da tela menos o breadcrumb;
   abas em 8 colunas, à direita, ocupando o resto da tela.

Em telas de até 900px, breadcrumb, lateral e abas ficam um embaixo do outro, todos com a
largura toda, e a lateral fica com a altura do conteúdo.

### Estados
| Estado     | Quando                                         | O que deve ser exibido                                                                                         |
| ---------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Carregando | A filial está sendo buscada                    | Breadcrumb e abas visíveis; lateral e Cadastro em skeleton; `aria-busy` na área das abas                        |
| Carregada  | Filial encontrada                              | Lateral com o resumo e a aba aberta com o conteúdo                                                             |
| Erro       | A filial não existe ou a busca falhou          | Volta para a lista com o toast de erro (não há estado de erro dentro da página)                                |

### Comportamentos
- **Dado** a home aberta pela URL com `?aba=almoxarifado` ou `?aba=repositorio`, **quando** a
  página carrega, **então** abre na aba indicada; sem o parâmetro, ou com outro valor, abre em
  Cadastro. Trocar de aba não altera a URL.
- **Dado** a home aberta a partir da lista, **quando** a página carrega, **então** usa a filial
  que a lista já conferiu, sem buscar de novo; aberta direto pela URL, busca a filial.

### CSS
| Classe                       | Definição                                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| :host                        | display: grid;<br>grid-template-columns: repeat(10, minmax(0, 1fr));<br>grid-template-rows: auto 1fr;<br>align-items: start;<br>gap: 16px;<br>min-height: 100vh;<br>padding: 16px;<br>box-sizing: border-box; |
| .branch-breadcrumb           | grid-column: 1 / -1;                                                                                                                            |
| .branch-breadcrumb__nav.p-breadcrumb | padding: 0;<br>border: none;<br>border-radius: 0;<br>background: transparent;<br>font-size: 12px;<br>line-height: 18px;                  |
| .branch-breadcrumb__nav .p-breadcrumb-list | gap: 6px;                                                                                                                         |
| .branch-breadcrumb__nav .p-menuitem-separator | margin: 0;<br>color: #9CA3AF;                                                                                                  |
| .branch-breadcrumb__nav .p-menuitem-link | padding: 0;<br>border-radius: 2px;                                                                                                  |
| .branch-breadcrumb__nav .p-menuitem-link .p-menuitem-text | color: #3B82F6;                                                                                                    |
| .branch-breadcrumb__nav .p-menuitem-link:hover .p-menuitem-text | text-decoration: underline;                                                                                  |
| .branch-breadcrumb__nav .p-menuitem:last-child .p-menuitem-link | cursor: default;                                                                                             |
| .branch-breadcrumb__nav .p-menuitem:last-child .p-menuitem-text | color: #6B7280;<br>text-decoration: none;                                                                    |
| app-branch-sidebar           | grid-column: span 2;<br>height: calc(100vh - 32px - 34px);                                                                                       |
| .branch-main                 | grid-column: span 8;<br>min-width: 0;<br>display: flex;<br>flex-direction: column;                                                              |
| :host (até 900px)            | grid-template-rows: auto auto 1fr;                                                                                                              |
| app-branch-sidebar, .branch-main (até 900px) | grid-column: 1 / -1;                                                                                                            |
| app-branch-sidebar (até 900px) | height: auto;                                                                                                                                 |

Usa também `.req-tabs` (globais).
