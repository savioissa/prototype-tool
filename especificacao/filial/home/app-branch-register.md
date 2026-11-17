# app-branch-register

### Aplicação
Conteúdo da aba Cadastro da home da filial. Mostra os dados cadastrais da filial em modo de
leitura e permite editá-los, salvar ou cancelar.

### Componentização
| Componente          | Tipo    | Onde é usado                                                      |
| ------------------- | ------- | ----------------------------------------------------------------- |
| `app-branch-fields` | Interno | Campos Código e Descrição, sempre (`../criacao/app-branch-fields.md`) |
| `p-button`          | Externo | Botões "Editar", "Cancelar" e "Salvar"                           |
| `p-confirmDialog`   | Externo | Confirmação de cancelamento e de saída com edição em andamento    |
| `p-toast`           | Externo | Aviso de erro ao salvar (toast global da aplicação)               |

### Elementos

#### Botão "Editar"
- **Tag:** `portal.generic.button.edit`
- **Componente:** `p-button`
- **Ícone:** `pi pi-pencil`
- **CSS:** `btn--md btn--primary` (globais)
- **Comportamento:** ao clicar, entra em edição: os campos ficam habilitados e o botão dá lugar a "Cancelar" e "Salvar".
- **Regras:** só aparece fora da edição; desabilitado enquanto a filial carrega.

#### Botão "Cancelar"
- **Tag:** `portal.generic.button.cancel`
- **Componente:** `p-button`
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar sem ter alterado nenhum campo, sai da edição direto. Com alguma alteração, abre o diálogo de cancelamento.
- **Regras:** só aparece em edição; desabilitado enquanto salva.

#### Botão "Salvar"
- **Tag:** `portal.generic.button.save`
- **Componente:** `p-button`
- **CSS:** `btn--md btn--primary` (globais)
- **Comportamento:** ao clicar (ou ao pressionar Enter num campo), grava código e descrição sem os espaços das pontas. Sucesso: sai da edição e os campos mostram os valores gravados. Código já usado por outra filial: o erro aparece abaixo do campo Código e a edição continua. Outra falha: toast de erro e a edição continua.
- **Regras:** só aparece em edição; desabilitado enquanto houver campo inválido ou nenhuma alteração; mostra o indicador de carregamento enquanto salva.

#### Aviso de erro ao salvar
- **Tag:** `iclass.generic.label.could-not-save-branch`
- **Componente:** `p-toast` (gravidade erro)
- **Regras:** aparece por 6 segundos quando a gravação falha por um motivo que não é código repetido; é o mesmo padrão da página de criação.

#### Campos
- **Componente:** `app-branch-fields`
- **Regras:** em leitura fora da edição; habilitados em edição; em skeleton enquanto a filial carrega. Mostram os valores gravados da filial.

#### Diálogo de cancelamento
- **Tag:** mensagem `portal.generic.label.confirm-cancel`; botões `iclass.generic.label.discard-changes` e `portal.generic.label.keep-editing`.
- **Componente:** `p-confirmDialog`, sem título
- **CSS:** `leave-dialog` (globais); 420px de largura. "Descartar alterações" `btn--md btn--danger`; "Continuar editando" `btn--md btn--neutral` (globais); sem ícones.
- **Comportamento:** "Descartar alterações" volta os campos aos valores gravados e sai da edição; "Continuar editando" (ou Esc) fecha o diálogo e mantém a edição.
- **Regras:** aparece ao clicar em "Cancelar" com alguma alteração. Ao abrir, o foco fica em "Continuar editando".

#### Diálogo de saída
- **Tag:** mensagem `portal.generic.label.branch-leave-description`; botões `iclass.generic.label.leave` e `portal.generic.label.keep-editing`.
- **Componente:** `p-confirmDialog`, sem título
- **CSS:** igual ao diálogo de cancelamento; "Sair" `btn--md btn--danger`.
- **Comportamento:** "Sair" descarta a edição e conclui a saída; "Continuar editando" (ou Esc) fecha o diálogo, cancela a saída e mantém a edição.
- **Regras:** mesmo diálogo da página de criação (`../criacao/app-branch-form.md`); aparece quando o usuário tenta sair da aba Cadastro ou da página estando em edição, com ou sem alteração (ver Fluxo em `README.md`). Ao abrir, o foco fica em "Continuar editando".

### Layout
Uma coluna com 4px entre os blocos:

1. **Barra de ações (alinhada à direita, 8px entre botões):** "Editar", ou "Cancelar" e "Salvar" em edição.
2. **Campos** (`app-branch-fields`).

Os diálogos aparecem centralizados sobre a página.

### Estados
| Estado                  | Quando                                                      | O que deve ser exibido                                                                                     |
| ----------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Carregando              | A filial está sendo buscada                                 | "Editar" desabilitado e campos em skeleton                                                                 |
| Leitura                 | Filial carregada, fora da edição                            | "Editar" e os campos desabilitados com os valores gravados                                                 |
| Edição                  | O usuário clicou em "Editar"                                | "Cancelar" e "Salvar" e os campos habilitados; "Salvar" desabilitado até haver alteração válida             |
| Salvando                | O usuário clicou em "Salvar"                                | "Salvar" com indicador de carregamento e "Cancelar" desabilitado                                           |
| Erro de validação       | Campo vazio, só com espaços ou código já usado              | Mensagem abaixo do campo (ver `../criacao/app-branch-fields.md`); "Salvar" desabilitado se o campo estiver vazio |
| Erro ao salvar          | A gravação falhou por outro motivo                          | Toast de erro `iclass.generic.label.could-not-save-branch`; continua em edição com os valores digitados     |
| Confirmando cancelamento | "Cancelar" com alguma alteração                            | Diálogo de cancelamento sobre a página                                                                     |
| Confirmando saída       | Tentativa de sair da aba ou da página em edição             | Diálogo de saída sobre a página                                                                            |

### Comportamentos
- **Dado** a aba em edição, **quando** outra filial é carregada (ou a mesma é recarregada com
  valores novos), **então** os campos voltam aos valores gravados, em leitura.

### CSS
| Classe       | Definição                                                         |
| ------------ | ----------------------------------------------------------------- |
| .tab-body    | display: flex;<br>flex-direction: column;<br>gap: 4px;            |
| .tab-toolbar | display: flex;<br>justify-content: flex-end;<br>gap: 8px;         |

Usa também `.leave-dialog` (globais).
