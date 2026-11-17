# app-branch-stock-partition-card

### Aplicação
Card que representa um almoxarifado. Mostra o código e a descrição do almoxarifado e, conforme
o lugar onde aparece, oferece desvincular, marcar para vincular ou escolher o almoxarifado,
além de abri-lo.

### Componentização
| Componente   | Tipo    | Onde é usado                                                 |
| ------------ | ------- | ------------------------------------------------------------ |
| `p-checkbox` | Externo | Caixa de seleção, na variação Selecionável                    |
| `p-button`   | Externo | Botões "Desvincular", "Selecionar" e "Abrir"                  |

O card tem quatro variações, definidas por onde é usado:

| Variação     | Onde                                                    | Ações                          |
| ------------ | ------------------------------------------------------- | ------------------------------ |
| Simples      | Almoxarifado já escolhido em `app-branch-stock-partition-picker` | "Abrir"               |
| Vinculado    | Lista da aba Almoxarifado (`app-branch-stock-partitions`) | "Desvincular" e "Abrir"      |
| Selecionável | Seção de vinculação (`app-branch-stock-partition-link`)  | Caixa de seleção e "Abrir"     |
| Escolha      | Lista de `app-branch-stock-partition-picker`             | "Selecionar" e "Abrir"         |

### Elementos

#### Caixa de seleção
- **Tag:** — (sem rótulo acessível)
- **Componente:** `p-checkbox` (binário)
- **Comportamento:** ao marcar ou desmarcar, avisa o contêiner (ver Fluxo em `README.md`).
- **Regras:** só na variação Selecionável; marcada quando o almoxarifado está entre os selecionados.

#### Rótulo "Código"
- **Tag:** `iclass.generic.label.code`
- **CSS:** `.kv-k` (globais)

#### Código do almoxarifado
- **CSS:** `.kv-v` (globais); truncado com reticências em uma linha, sem tooltip.
- **Origem do dado:** --

#### Rótulo "Descrição"
- **Tag:** `iclass.generic.label.description`
- **CSS:** `.kv-k` (globais)

#### Descrição do almoxarifado
- **CSS:** `.kv-v` (globais); truncado com reticências em uma linha, sem tooltip.
- **Origem do dado:** --

#### Botão "Desvincular"
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button` (modo texto)
- **Ícone:** `pi pi-link-slash` (corrente cortada; ícone desenhado na casca, ver `../css-global.md`)
- **CSS:** `btn--md btn--danger btn--text` (globais); vermelho.
- **Comportamento:** ao clicar, pede o desvínculo do almoxarifado (ver Fluxo em `README.md`).
- **Regras:** só na variação Vinculado; desabilitado enquanto a seção de vinculação da aba está aberta.

#### Botão "Selecionar"
- **Tag:** `iclass.generic.button.select`
- **Componente:** `p-button`
- **CSS:** `btn--md btn--primary card-actions__pick` (globais); 8px de distância do "Abrir".
- **Comportamento:** ao clicar, escolhe este almoxarifado (ver Fluxo em `README.md`).
- **Regras:** só na variação Escolha.

#### Botão "Abrir"
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button` (modo texto)
- **Ícone:** `pi pi-window-maximize`
- **CSS:** `btn--md btn--text icon-neutral` (globais)
- **Comportamento:** ao clicar, abre a home do almoxarifado (página fora desta especificação; ver Pastas em `../README.md`).
- **Regras:** aparece em todas as variações; na variação Vinculado, desabilitado enquanto a seção de vinculação da aba está aberta.

### Layout
O card é uma linha única, alinhada verticalmente ao centro, com 16px entre as colunas:

1. **Caixa de seleção (largura do conteúdo):** só na variação Selecionável.
2. **Código (255px; 240px na variação Selecionável):** rótulo acima do valor.
3. **Descrição (ocupa o espaço restante):** rótulo acima do valor.
4. **Ações (largura do conteúdo, alinhadas à direita, 2px entre elas):** "Desvincular" ou "Selecionar", e "Abrir".

Em telas de até 700px, Código e Descrição dividem a largura em partes iguais. Altura mínima
de 52px.

### Estados
| Estado      | Quando                                         | O que deve ser exibido                                                                          |
| ----------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Carregando  | A lista onde o card está é buscada              | O card inteiro vira um bloco de skeleton de 52px de altura e cantos de 10px; `aria-hidden`       |
| Padrão      | Almoxarifado carregado                          | Código, descrição e as ações da variação                                                        |
| Hover/foco  | Cursor sobre o card ou foco em uma ação         | Só o botão sob o cursor muda de fundo; o card não tem destaque próprio                 |
| Selecionado | Variação Selecionável com a caixa marcada       | Caixa marcada e borda do card em azul `#93C5FD`                                                 |
| Ações desabilitadas | Variação Vinculado com a seção de vinculação aberta | "Desvincular" e "Abrir" com opacidade 0,5, sem resposta ao clique                    |

### Comportamentos
— (não se aplica)

### CSS
| Classe                                     | Definição                                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| .stock-partition-card                      | grid-template-columns: 255px minmax(0, 1fr) auto;<br>min-height: 52px;<br>padding: 6px 12px 6px 20px; |
| .stock-partition-card--selectable          | grid-template-columns: auto 240px minmax(0, 1fr) auto;<br>padding-left: 16px;                     |
| .stock-partition-card--selected            | border-color: #93C5FD;                                                                          |
| .card-skeleton                             | height: 52px;<br>border-radius: 10px;                                                           |
| .stock-partition-card (até 700px)          | grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;                                      |
| .stock-partition-card--selectable (até 700px) | grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr) auto;                              |

Usa também `.reg-card`, `.kv`, `.kv-k`, `.kv-v`, `.skeleton`, `.card-actions` e
`.card-actions__pick` (globais).
