# app-branch-form

### Aplicação
Contêiner da página de criação de filial. Mostra o título, os campos de cadastro e as ações de
salvar e cancelar, e confirma a saída quando há dados preenchidos.

### Componentização
| Componente          | Tipo    | Onde é usado                                          |
| ------------------- | ------- | ----------------------------------------------------- |
| `app-branch-fields` | Interno | Campos Código e Descrição, sempre (`app-branch-fields.md`) |
| `p-button`          | Externo | "Cancelar" e "Salvar"                                 |
| `p-confirmDialog`   | Externo | Confirmação de saída                                  |
| `p-toast`           | Externo | Avisos de sucesso e de erro ao salvar (toast global da aplicação) |

### Elementos

#### Título da página
- **Tag:** `iclass.generic.label.new-branch`
- **CSS:** `.t-title-lg` (globais) `.page-header__title` (globais); h1.

#### Botão "Cancelar"
- **Tag:** `portal.generic.button.cancel`
- **Componente:** `p-button`
- **CSS:** `btn--lg btn--neutral` (globais)
- **Comportamento:** ao clicar, com os dois campos vazios, volta direto para a lista (`/filial`); com algum campo preenchido, abre o diálogo de saída.
- **Regras:** desabilitado enquanto salva.

#### Botão "Salvar"
- **Tag:** `portal.generic.button.save`
- **Componente:** `p-button`
- **CSS:** `btn--lg btn--primary` (globais)
- **Comportamento:** ao clicar (ou ao pressionar Enter num campo), cria a filial com código e descrição sem os espaços das pontas. Sucesso: toast `iclass.generic.label.branch-created-successfully` (4 segundos) e abre a home da filial criada (`/filial/:codigo`), substituindo a página de criação no histórico do navegador. Código já existente: o erro aparece abaixo do campo Código (ver `app-branch-fields.md`). Outra falha: toast de erro `iclass.generic.label.could-not-create-branch` (6 segundos) e a página continua preenchida.
- **Regras:** desabilitado enquanto houver campo inválido; mostra o indicador de carregamento enquanto salva.

#### Campos
- **Componente:** `app-branch-fields`
- **Regras:** começam vazios e habilitados.

#### Diálogo de saída
- **Tag:** mensagem `portal.generic.label.branch-leave-description`; botões `iclass.generic.label.leave` e `portal.generic.label.keep-editing`.
- **Componente:** `p-confirmDialog`, sem título
- **CSS:** `leave-dialog` (globais); 420px de largura. "Sair" `btn--md btn--danger`; "Continuar editando" `btn--md btn--neutral` (globais); sem ícones.
- **Comportamento:** "Sair" descarta o que foi preenchido e volta para a lista; "Continuar editando" fecha o diálogo e mantém os dados.
- **Regras:** ao abrir, o foco fica em "Continuar editando".

### Layout
A página é uma coluna com altura mínima da tela:

1. **Cabeçalho (topo, preso ao rolar):** título à esquerda; "Cancelar" e "Salvar" à direita, com 10px entre eles.
2. **Conteúdo (largura toda):** campos Código e Descrição.

Mesmas margens do cabeçalho e do conteúdo da lista (`.page-header`, `.page-content`, globais).

### Estados
| Estado             | Quando                                                  | O que deve ser exibido                                                                 |
| ------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Em branco          | Ao abrir a página                                       | Campos vazios, "Salvar" desabilitado                                                   |
| Erro de validação  | Campo vazio, só com espaços ou código já existente      | Mensagem abaixo do campo; "Salvar" desabilitado enquanto houver campo inválido          |
| Salvando           | O usuário clicou em "Salvar"                            | "Salvar" com indicador de carregamento e "Cancelar" desabilitado                       |
| Erro ao salvar     | A criação falhou por outro motivo                       | Toast de erro; campos preenchidos e ações habilitadas                                  |
| Confirmando saída  | "Cancelar" com algum campo preenchido                   | Diálogo de saída sobre a página                                                        |

### Comportamentos
— (não se aplica)

### CSS
| Classe       | Definição                                                     |
| ------------ | ------------------------------------------------------------- |
| :host        | display: block;                                               |
| .branch-form | display: flex;<br>flex-direction: column;<br>min-height: 100vh; |

Usa também `.page-header`, `.page-header__title`, `.page-header__actions`, `.page-content`,
`.t-title-lg` e `.leave-dialog` (globais).
