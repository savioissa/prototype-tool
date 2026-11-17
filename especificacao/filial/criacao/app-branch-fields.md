# app-branch-fields

### Aplicação
Campos de cadastro da filial, Código e Descrição, lado a lado. É usado na página de criação e
na aba Cadastro da home. Mostra as validações de cada campo e, na home, aparece em modo de
leitura até o usuário editar.

### Componentização
| Componente   | Tipo    | Onde é usado          |
| ------------ | ------- | --------------------- |
| `pInputText` | Externo | Campos Código e Descrição |

### Elementos

#### Rótulo "Código"
- **Tag:** `iclass.generic.label.code`, seguido de um asterisco vermelho (`aria-hidden`).
- **CSS:** `.t-label-field` (globais) `.form-field__label`; asterisco `.form-field__required`.
- **Regras:** associado ao campo Código.

#### Campo Código
- **Componente:** `pInputText`
- **CSS:** `.ui-input` (globais) `.form-field__input`; com erro, `.form-field__input--invalid`.
- **Comportamento:** ao digitar, valida o campo; a mensagem de erro aparece depois que o usuário digitou ou saiu do campo.
- **Regras:** obrigatório (`aria-required`); não aceita valor só com espaços; até 100 caracteres (o campo não deixa digitar além disso); sem preenchimento automático do navegador. Espaços nas pontas são removidos ao salvar. Com erro visível, recebe `aria-invalid` e aponta para a mensagem com `aria-describedby`. Em modo de leitura, fica desabilitado com fundo cinza.
- **Origem do dado:** --

#### Mensagem de erro do Código
- **Tag:** `iclass.generic.label.enter-code` (vazio ou só espaços) ou `iclass.generic.label.branch-code-already-exists` (código já usado por outra filial).
- **CSS:** `.form-field__error`
- **Regras:** só aparece com o campo inválido e depois que o usuário digitou ou saiu dele. O erro de código já existente vem da resposta ao salvar e tem prioridade sobre o de vazio.

#### Rótulo "Descrição"
- **Tag:** `iclass.generic.label.description`, seguido de um asterisco vermelho (`aria-hidden`).
- **CSS:** `.t-label-field` (globais) `.form-field__label`; asterisco `.form-field__required`.
- **Regras:** associado ao campo Descrição.

#### Campo Descrição
- **Componente:** `pInputText`
- **CSS:** `.ui-input` (globais) `.form-field__input`; com erro, `.form-field__input--invalid`.
- **Comportamento:** ao digitar, valida o campo, com a mesma regra de exibição do Código.
- **Regras:** obrigatório; não aceita valor só com espaços; até 100 caracteres; espaços nas pontas removidos ao salvar; mesma acessibilidade e modo de leitura do Código.
- **Origem do dado:** --

#### Mensagem de erro da Descrição
- **Tag:** `iclass.generic.label.enter-description`
- **CSS:** `.form-field__error`
- **Regras:** só aparece com o campo vazio (ou só com espaços) e depois que o usuário digitou ou saiu dele.

### Layout
Grade de duas colunas de mesma largura, com 16px entre elas:

1. **Esquerda:** rótulo, campo e mensagem do Código, empilhados com 6px entre eles.
2. **Direita:** rótulo, campo e mensagem da Descrição.

Em telas de até 700px, os campos ficam um embaixo do outro.

### Estados
| Estado           | Quando                                                    | O que deve ser exibido                                                                                     |
| ---------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Carregando       | A filial ainda está sendo buscada (aba Cadastro da home)   | Cada campo (rótulo + campo) vira um bloco de skeleton de 66px de altura e cantos de 6px; `aria-hidden`       |
| Em branco        | Página de criação recém-aberta                            | Rótulos e campos vazios, sem mensagens                                                                     |
| Leitura          | Aba Cadastro fora da edição                               | Campos desabilitados com os valores gravados: fundo `#EDEEF0`, borda `#D9DCE1`, texto `#9CA3AF`, sem sombra |
| Edição           | Criação, ou aba Cadastro depois de "Editar"               | Campos habilitados                                                                                         |
| Erro de validação | Campo inválido depois que o usuário digitou ou saiu dele | Borda vermelha `#DC2626` no campo e mensagem vermelha abaixo dele                                           |
| No limite        | Campo com 100 caracteres                                  | O campo não aceita mais caracteres                                                                         |

### Comportamentos
- **Dado** um campo inválido ainda não tocado, **quando** o usuário só olha o formulário,
  **então** nenhuma mensagem aparece; ela aparece ao digitar ou ao sair do campo.

### CSS
| Classe                              | Definição                                                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| .form-grid                          | display: grid;<br>grid-template-columns: repeat(2, minmax(0, 1fr));<br>gap: 16px;                                                  |
| .form-field                         | display: flex;<br>flex-direction: column;<br>gap: 6px;<br>min-width: 0;                                                            |
| .form-field__label                  | color: #1F2937;                                                                                                                   |
| .form-field__required               | color: #DC2626;<br>margin-left: 2px;                                                                                              |
| .form-field__input                  | box-shadow: 0 1px 2px rgba(16, 24, 40, .06);                                                                                      |
| .form-field__input:disabled         | opacity: 1;<br>background: #EDEEF0;<br>border-color: #D9DCE1;<br>color: #9CA3AF;<br>box-shadow: none;                              |
| .form-field__input--invalid, .form-field__input--invalid:focus | border-color: #DC2626;                                                                                 |
| .form-field__input--invalid:focus   | outline-color: #DC262655;                                                                                                         |
| .form-field__error                  | font: var(--secondary-sm);<br>color: #DC2626;                                                                                     |
| .field-skeleton                     | height: 66px;<br>border-radius: 6px;                                                                                              |
| .form-grid (até 700px)              | grid-template-columns: minmax(0, 1fr);                                                                                            |

Os campos usam também `.ui-input`, `.t-label-field` e `.skeleton` (globais).
