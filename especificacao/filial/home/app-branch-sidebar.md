# app-branch-sidebar

### Aplicação
Lateral da home da filial que identifica a filial aberta: mostra a descrição como título e
os dados de código e descrição. Fica visível enquanto o usuário navega pelas abas.

### Componentização
— (não se aplica)

### Elementos

#### Sobretítulo "Filial"
- **Tag:** `branch`
- **CSS:** `.summary__overline`; azul `#3B82F6`.

#### Título
- **CSS:** `.summary__title`; h1; quebra linha em qualquer ponto quando o texto não cabe.
- **Regras:** mostra a descrição da filial. Depois de gravar o cadastro, mostra o valor novo.
- **Origem do dado:** --

#### Rótulo "Código"
- **Tag:** `iclass.generic.label.code`
- **CSS:** `.kv-k` (globais) `.summary__k`

#### Código da filial
- **CSS:** `.summary__v`; quebra linha em qualquer ponto.
- **Regras:** depois de gravar o cadastro, mostra o valor novo.
- **Origem do dado:** --

#### Rótulo "Descrição"
- **Tag:** `iclass.generic.label.description`
- **CSS:** `.kv-k` (globais) `.summary__k`

#### Descrição da filial
- **CSS:** `.summary__v`; quebra linha em qualquer ponto.
- **Regras:** repete o texto do título; depois de gravar o cadastro, mostra o valor novo.
- **Origem do dado:** --

### Layout
Um cartão branco com borda, sombra e cantos de 4px, que ocupa toda a altura disponível e
rola por dentro quando o conteúdo passa dela. De cima para baixo:

1. Sobretítulo "Filial".
2. Título (descrição), com 12px abaixo.
3. Lista de pares rótulo/valor (Código, Descrição), com 8px entre os pares; rótulo acima do valor.

A lateral fica presa ao topo ao rolar a página (16px do topo). Em telas de até 900px, deixa de
ser presa e fica com a altura do conteúdo.

### Estados
| Estado     | Quando                      | O que deve ser exibido                                                                                     |
| ---------- | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Carregando | A filial está sendo buscada | A lateral inteira vira um bloco de skeleton com a mesma altura e cantos de 4px (140px em telas até 900px); `aria-hidden` |
| Padrão     | Filial carregada            | Sobretítulo, título e os dois pares rótulo/valor                                                           |

### Comportamentos
— (não se aplica)

### CSS
| Classe                     | Definição                                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| :host                      | position: sticky;<br>top: 16px;<br>display: block;<br>min-width: 0;<br>height: calc(100vh - 32px);                       |
| .summary, .summary-skeleton | height: 100%;<br>box-sizing: border-box;<br>border-radius: 4px;                                                        |
| .summary                   | padding: 16px;<br>background: #fff;<br>border: 1px solid #E5E7EB;<br>box-shadow: 0 2px 6px rgba(16, 24, 40, .08);<br>overflow-y: auto; |
| .summary__overline         | display: block;<br>font: var(--secondary-md);<br>color: #3B82F6;                                                         |
| .summary__title            | margin: 0 0 12px;<br>font: 500 18px/24px var(--font-family-text);<br>color: #111827;<br>overflow-wrap: anywhere;          |
| .summary__list             | display: flex;<br>flex-direction: column;<br>gap: 8px;<br>margin: 0;                                                     |
| .summary__k                | color: #6B7280;                                                                                                         |
| .summary__v                | margin: 0;<br>font: var(--secondary-md);<br>color: #212121;<br>overflow-wrap: anywhere;                                  |
| :host (até 900px)          | position: static;<br>height: auto;                                                                                      |
| .summary-skeleton (até 900px) | height: 140px;                                                                                                       |

Usa também `.kv`, `.kv-k` e `.skeleton` (globais).
