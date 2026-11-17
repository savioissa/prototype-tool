# app-branch-filter

### Aplicação
Painel onde o usuário restringe um resultado de registros com código e descrição. Tem dois
campos, Código e Descrição, cada um com operador e valor. É usado na lista de filiais e nas
listas de almoxarifados da home (aba Almoxarifado, seção de vinculação e escolha de
almoxarifado).

### Componentização
| Componente   | Tipo    | Onde é usado                       |
| ------------ | ------- | ---------------------------------- |
| `p-dropdown` | Externo | Operador de cada campo             |
| `pInputText` | Externo | Valor de cada campo                |

### Elementos

#### Rótulo "Código"
- **Tag:** `iclass.generic.label.code`
- **CSS:** `.filter-panel__label` (globais); maiúsculas.
- **Regras:** associado ao valor do campo Código (clicar no rótulo foca o valor).

#### Operador do Código
- **Tag:** placeholder `iclass.generic.label.select-operator`; opções `iclass.generic.label.equals`, `iclass.generic.label.different`, `iclass.generic.label.contains`, `iclass.generic.label.starts-with`, `iclass.generic.label.ends-with`, nesta ordem.
- **Componente:** `p-dropdown`, com a lista aberta no `body`.
- **CSS:** `filter-panel__operator`; lista `filter-panel__operator-panel` (globais); 104px de largura.
- **Comportamento:** ao escolher, guarda o operador no filtro em edição; o resultado não muda até o filtro ser aplicado (ver Fluxo da página onde o painel está).
- **Regras:** começa em "Contém".

#### Valor do Código
- **Componente:** `pInputText`
- **CSS:** `.filter-panel__input` (globais); ocupa o espaço restante ao lado do operador.
- **Comportamento:** ao digitar, guarda o valor no filtro em edição, sem aplicar.
- **Regras:** começa vazio; sem placeholder.

#### Rótulo "Descrição"
- **Tag:** `iclass.generic.label.description`
- **CSS:** `.filter-panel__label` (globais); maiúsculas.
- **Regras:** associado ao valor do campo Descrição.

#### Operador da Descrição
- **Tag:** placeholder `iclass.generic.label.select-operator`; mesmas opções do operador do Código.
- **Componente:** `p-dropdown`, com a lista aberta no `body`.
- **CSS:** `filter-panel__operator`; lista `filter-panel__operator-panel` (globais)
- **Comportamento:** ao escolher, guarda o operador no filtro em edição, sem aplicar.
- **Regras:** começa em "Contém". Se o usuário limpar o operador, aparece o placeholder "Operador" e a busca usa "Contém".

#### Valor da Descrição
- **Componente:** `pInputText`
- **CSS:** `.filter-panel__input` (globais)
- **Comportamento:** ao digitar, guarda o valor no filtro em edição, sem aplicar.
- **Regras:** começa vazio; sem placeholder.

### Layout
O painel é uma grade de duas colunas de mesma largura, com 16px entre elas:

1. **Esquerda:** campo Código (rótulo acima; operador e valor lado a lado, com 2px entre eles).
2. **Direita:** campo Descrição, com a mesma estrutura.

Em telas de até 700px, os dois campos ficam um embaixo do outro. O painel tem fundo cinza,
borda e cantos de 4px (`.filter-panel`, globais) e ocupa a largura toda do conteúdo.

### Estados
| Estado            | Quando                                              | O que deve ser exibido                                                                                         |
| ----------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Fechado           | O botão de filtro do contêiner não está ativo       | O painel não aparece                                                                                           |
| Aberto            | O usuário ligou o botão de filtro do contêiner      | Os dois campos com os operadores e valores em edição                                                           |
| Com filtro ativo  | Um filtro com valor foi aplicado                    | Painel aberto: os campos com os valores aplicados. Painel fechado: nenhuma indicação; o resultado continua filtrado |

### Comportamentos
- **Dado** o painel aberto, **quando** o usuário altera operador ou valor, **então** a alteração
  fica guardada como filtro em edição e só passa a valer quando o contêiner aplica o filtro.
- **Dado** um filtro aplicado, **quando** a comparação é feita, **então** ela não diferencia
  maiúsculas, minúsculas nem acentos e ignora espaços nas pontas do valor; valor vazio não
  restringe nada; os dois campos se somam (E).
- **Dado** os operadores, **quando** usados, **então** "Igual" exige o texto inteiro igual,
  "Diferente" exclui o texto igual, "Contém" procura em qualquer posição, "Começa com" e
  "Termina com" comparam o início e o fim.
- **Dado** o painel fechado e aberto de novo, **quando** reaparece, **então** mostra os valores
  em edição de antes; fechar o painel não limpa o filtro.

### CSS
| Classe                              | Definição                                               |
| ----------------------------------- | ------------------------------------------------------- |
| .filter-panel--cols-2               | grid-template-columns: repeat(2, minmax(0, 1fr));       |
| .filter-panel--cols-2 (até 700px)   | grid-template-columns: minmax(0, 1fr);                  |

O painel usa também `.filter-panel`, `.filter-panel__field`, `.filter-panel__label`,
`.filter-panel__control`, `.filter-panel__input`, `.filter-panel__operator` e
`.filter-panel__operator-panel` (globais).
