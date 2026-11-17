# app-branch-card

### Aplicação
Card que representa uma filial na lista de filiais. Mostra o código e a descrição da filial e
dá acesso à home da filial pelo botão "Abrir".

### Componentização
| Componente | Tipo    | Onde é usado                       |
| ---------- | ------- | ---------------------------------- |
| `p-button` | Externo | Botão "Abrir", à direita do card   |

### Elementos

#### Rótulo "Código"
- **Tag:** `iclass.generic.label.code`
- **CSS:** `.kv-k` (globais)

#### Código da filial
- **CSS:** `.kv-v` (globais); truncado com reticências em uma linha.
- **Regras:** até 100 caracteres (limite do cadastro, ver `../criacao/app-branch-fields.md`); o texto que não cabe na coluna é cortado com reticências, sem tooltip.
- **Origem do dado:** --

#### Rótulo "Descrição"
- **Tag:** `iclass.generic.label.description`
- **CSS:** `.kv-k` (globais)

#### Descrição da filial
- **CSS:** `.kv-v` (globais); truncado com reticências em uma linha.
- **Regras:** até 100 caracteres; o texto que não cabe na coluna é cortado com reticências, sem tooltip.
- **Origem do dado:** --

#### Botão "Abrir"
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button` (modo texto)
- **Ícone:** `pi pi-window-maximize`
- **CSS:** `btn--md btn--text icon-neutral` (globais)
- **Comportamento:** ao clicar, pede a abertura da home desta filial (a conferência e a navegação estão no Fluxo de `README.md`).
- **Regras:** enquanto a filial é conferida antes de abrir, o botão mostra o indicador de carregamento do `p-button` no lugar do ícone. Só o botão é clicável; o restante do card não responde ao clique.

### Layout
O card é uma linha única com três colunas, alinhadas verticalmente ao centro e com 16px entre
elas:

1. **Esquerda (290px):** rótulo "Código" acima do código.
2. **Centro (ocupa o espaço restante):** rótulo "Descrição" acima da descrição.
3. **Direita (largura do conteúdo):** botão "Abrir".

Em telas de até 700px, as duas primeiras colunas dividem a largura em partes iguais.
Altura mínima de 60px.

### Estados
| Estado     | Quando                                         | O que deve ser exibido                                                                                       |
| ---------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Carregando | Enquanto a lista de filiais é buscada          | O card inteiro vira um único bloco de skeleton de 60px de altura e cantos de 10px; `aria-hidden`              |
| Padrão     | Filial carregada                               | Código, descrição e o botão "Abrir"                                                                          |
| Hover/foco | Cursor sobre o card ou foco no botão "Abrir"   | Só o botão "Abrir" muda (fundo `#f1f2f4`); o card não tem destaque próprio                          |
| Abrindo    | O usuário clicou em "Abrir" e a filial está sendo conferida | Botão "Abrir" com indicador de carregamento                                                     |

### Comportamentos
— (não se aplica)

### CSS
| Classe         | Definição                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------- |
| .branch-card   | grid-template-columns: 290px minmax(0, 1fr) auto;<br>min-height: 60px;<br>padding: 8px 12px 8px 22px; |
| .card-skeleton | height: 60px;<br>border-radius: 10px;                                                                |
| .branch-card (até 700px) | grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;                                 |

O card usa também `.reg-card`, `.kv`, `.kv-k`, `.kv-v` e `.skeleton` (globais).
