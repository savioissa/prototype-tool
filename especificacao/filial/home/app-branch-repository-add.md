# app-branch-repository-add

### Aplicação
Tela "Adicionar repositório" da aba Repositório. O usuário escolhe um almoxarifado e um
repositório e salva o par (vínculo) na filial.

### Componentização
| Componente                          | Tipo    | Onde é usado                                                  |
| ----------------------------------- | ------- | ------------------------------------------------------------- |
| `app-branch-stock-partition-picker` | Interno | Campo Almoxarifado, sempre (`app-branch-stock-partition-picker.md`) |
| `app-branch-repository-picker`      | Interno | Campo Repositório, sempre (`app-branch-repository-picker.md`) |
| `p-button`                          | Externo | "Cancelar" e "Salvar"                                         |

### Elementos

#### Título "Adicionar repositório"
- **Tag:** `iclass.generic.label.add-repository`
- **CSS:** `.t-title-sm` (globais) `.add-panel__title`; h2; nomeia a tela (`aria-labelledby`).

#### Botão "Cancelar"
- **Tag:** `portal.generic.button.cancel`
- **Componente:** `p-button`
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar, fecha a tela sem salvar e sem pedir confirmação (ver Fluxo em `README.md`).
- **Regras:** desabilitado enquanto salva.

#### Botão "Salvar"
- **Tag:** `portal.generic.button.save`
- **Componente:** `p-button`
- **CSS:** `btn--md btn--primary` (globais)
- **Comportamento:** ao clicar, salva o par na filial. Se o almoxarifado ainda não estava vinculado à filial, ele é vinculado também. Sucesso: toast `iclass.generic.label.repository-added-successfully` (4 segundos) e a tela avisa a aba (ver Fluxo). Falha: toast de erro `iclass.generic.label.could-not-add-repository` (6 segundos) e a tela continua aberta com as escolhas.
- **Regras:** desabilitado até haver almoxarifado e repositório escolhidos, e enquanto o par já estiver vinculado à filial; mostra o indicador de carregamento enquanto salva.

#### Campo Almoxarifado
- **Componente:** `app-branch-stock-partition-picker`

#### Campo Repositório
- **Componente:** `app-branch-repository-picker`
- **CSS:** `.add-panel__repository`; 8px a mais de distância do campo Almoxarifado.

#### Alerta de par já vinculado
- **Tag:** `iclass.generic.label.repository-already-linked-to-stock-partition`
- **Ícone:** `pi pi-exclamation-circle`
- **CSS:** `.form-alert` (globais)
- **Regras:** aparece enquanto o almoxarifado e o repositório escolhidos já formam um par vinculado à filial; some ao trocar qualquer um dos dois.

### Layout
Uma caixa cinza com borda e cantos de 10px (`.insumo-layer`, globais), em coluna com 12px entre
os blocos:

1. **Cabeçalho:** título à esquerda; "Cancelar" e "Salvar" à direita, com 8px entre eles.
2. **Campo Almoxarifado.**
3. **Campo Repositório.**
4. **Alerta de par já vinculado**, quando aparece.

### Estados
| Estado            | Quando                                                        | O que deve ser exibido                                                                     |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Inicial           | Ao abrir a tela                                               | Seleção de almoxarifado aberta, área clicável do repositório e "Salvar" desabilitado       |
| Par escolhido     | Almoxarifado e repositório escolhidos, par novo               | Os dois cards escolhidos e "Salvar" habilitado                                             |
| Par já vinculado  | O par escolhido já existe na filial                           | Alerta com `pi pi-exclamation-circle` e `iclass.generic.label.repository-already-linked-to-stock-partition`; "Salvar" desabilitado |
| Salvando          | O usuário clicou em "Salvar"                                  | "Salvar" com indicador de carregamento e "Cancelar" desabilitado                           |

### Comportamentos
- **Dado** nenhum repositório escolhido, **quando** o usuário escolhe o almoxarifado, **então** a
  seleção de repositório abre sozinha. Com repositório já escolhido, nada muda no campo
  Repositório.
- **Dado** um par escolhido, **quando** ele é comparado aos vínculos da filial, **então** a
  comparação considera o tipo e o código do repositório e o código do almoxarifado (o mesmo
  código pode existir em tipos diferentes).

### CSS
| Classe                 | Definição                                              |
| ---------------------- | ------------------------------------------------------ |
| .add-panel__header     | display: flex;<br>align-items: center;<br>gap: 12px;   |
| .add-panel__title      | margin: 0;<br>color: #1F2937;                          |
| .add-panel__repository | margin-top: 8px;                                       |
| .add-panel__actions    | display: flex;<br>gap: 8px;<br>margin-left: auto;      |

Usa também `.insumo-layer`, `.t-title-sm` e `.form-alert` (globais).
