# Filial — lista

### Propósito
Lista as filiais cadastradas. Permite ao usuário localizar uma filial por filtro e ordenação,
abrir a home de uma filial e iniciar a criação de uma nova. Rota: `/filial` (também é a página
inicial da aplicação).

### Componentização
| Componente          | Tipo    | Papel na página                                                   |
| ------------------- | ------- | ----------------------------------------------------------------- |
| `app-branch-list`   | Interno | Contêiner da página: cabeçalho, estados e paginação.              |
| `app-branch-filter` | Interno | Painel opcional. Restringe o resultado por Código e Descrição.    |
| `app-branch-sort`   | Interno | Painel opcional. Escolhe o campo e a direção da ordenação.        |
| `app-branch-card`   | Interno | Representa uma filial. Repete-se para cada filial da página.      |
| `p-paginator`       | Externo | Paginação do resultado.                                           |
| `p-button`          | Externo | Botões de ação do cabeçalho.                                      |
| `p-toast`           | Externo | Aviso de erro ao abrir uma filial.                                |

### Layout
A página é dividida em duas seções:

1. **Cabeçalho (topo, preso ao rolar):** título "Filial" e os botões "Novo", filtro, ordenação e "Atualizar".
2. **Conteúdo (abaixo do cabeçalho):** um `app-branch-card` por filial, empilhados em uma coluna, e o `p-paginator` abaixo, alinhado à direita.

Os painéis `app-branch-filter` e `app-branch-sort`, quando abertos, aparecem no topo do
conteúdo, nesta ordem, acima dos cards.

### Fluxo entre os componentes
- **Dado** o painel de filtro aberto, **quando** o usuário altera um operador ou valor em
  `app-branch-filter` (saída `filterChange`), **então** `app-branch-list` guarda o filtro sem
  aplicá-lo, e a lista não muda.
- **Dado** um filtro preenchido no painel, **quando** o usuário clica em "Atualizar" em
  `app-branch-list`, **então** a lista recarrega aplicando esse filtro, mantém a ordenação, volta
  à página 1 e mostra o estado Com resultados ou Sem resultado.
- **Dado** o painel de ordenação aberto, **quando** o usuário escolhe um campo, limpa o campo ou
  inverte a direção em `app-branch-sort` (saída `sortChange`), **então** `app-branch-list`
  reordena o resultado na hora e volta à página 1.
- **Dado** a lista com resultados, **quando** o usuário clica em "Abrir" em `app-branch-card`
  (saída `open`), **então** `app-branch-list` confere se a filial ainda existe, com o botão do
  card em carregamento; outros cliques em "Abrir" durante a conferência são ignorados. Encontrada:
  abre a home da filial (`/filial/:codigo`; ver `../home/README.md`) já com a filial, sem buscar
  de novo. Não encontrada ou falha: toast de erro `iclass.generic.label.could-not-load-branch` e o
  usuário continua na lista.
- **Dado** qualquer estado, **quando** o usuário clica em "Novo" em `app-branch-list`, **então**
  a página de criação é aberta (`/filial/nova`; ver `../criacao/README.md`).

### Referências visuais
— (não se aplica)
