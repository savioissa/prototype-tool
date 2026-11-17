# Filial — criação

### Propósito
Cadastra uma filial nova, com código e descrição. Ao salvar, leva o usuário à home da filial
criada. Rota: `/filial/nova`.

### Componentização
| Componente          | Tipo    | Papel na página                                                       |
| ------------------- | ------- | --------------------------------------------------------------------- |
| `app-branch-form`   | Interno | Contêiner da página: cabeçalho, salvar, cancelar e confirmação de saída. |
| `app-branch-fields` | Interno | Campos Código e Descrição, com as validações.                          |
| `p-button`          | Externo | "Cancelar" e "Salvar".                                                |
| `p-confirmDialog`   | Externo | Confirmação de saída com dados preenchidos.                           |
| `p-toast`           | Externo | Avisos de sucesso e de erro ao salvar.                                |

### Layout
A página é dividida em duas seções:

1. **Cabeçalho (topo, preso ao rolar):** título "Nova Filial" à esquerda; "Cancelar" e "Salvar" à direita.
2. **Conteúdo:** `app-branch-fields`, com Código e Descrição lado a lado.

### Fluxo entre os componentes
- **Dado** a página aberta, **quando** o usuário preenche os campos em `app-branch-fields`,
  **então** `app-branch-form` habilita "Salvar" assim que os dois campos são válidos.
- **Dado** os campos válidos, **quando** o usuário salva em `app-branch-form` e o código já
  existe, **então** `app-branch-fields` mostra `iclass.generic.label.branch-code-already-exists`
  abaixo do Código, e a página continua aberta.
- **Dado** a criação concluída, **quando** o toast de sucesso aparece, **então** a home da filial
  criada é aberta (`/filial/:codigo`; ver `../home/README.md`), e o "voltar" do navegador não
  reabre a página de criação.
- **Dado** algum campo preenchido em `app-branch-fields`, **quando** o usuário clica em
  "Cancelar" em `app-branch-form`, **então** abre o diálogo de saída; "Sair" volta para a lista
  (`/filial`; ver `../lista/README.md`).

### Referências visuais
— (não se aplica)
