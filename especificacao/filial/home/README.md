# Filial — home

### Propósito
Mostra uma filial e permite mantê-la: consultar e editar o cadastro, vincular e desvincular
almoxarifados e adicionar e desvincular repositórios. Rota: `/filial/:codigo`, com
`?aba=almoxarifado` ou `?aba=repositorio` opcionais para abrir direto numa aba.

### Componentização
| Componente                          | Tipo    | Papel na página                                                                |
| ----------------------------------- | ------- | ------------------------------------------------------------------------------ |
| `app-branch-detail`                 | Interno | Contêiner da página: breadcrumb, lateral, abas e carga da filial.               |
| `app-branch-sidebar`                | Interno | Lateral com a identificação da filial.                                         |
| `app-branch-register`               | Interno | Aba Cadastro: leitura e edição do cadastro.                                    |
| `app-branch-fields`                 | Interno | Campos do cadastro, dentro da aba Cadastro (`../criacao/app-branch-fields.md`). |
| `app-branch-stock-partitions`       | Interno | Aba Almoxarifado: almoxarifados vinculados.                                    |
| `app-branch-stock-partition-link`   | Interno | Seção opcional da aba Almoxarifado para vincular almoxarifados.                |
| `app-branch-stock-partition-card`   | Interno | Representa um almoxarifado; repete-se nas listas de almoxarifados.             |
| `app-branch-filter`                 | Interno | Painel de filtro das listas de almoxarifados (`../lista/app-branch-filter.md`). |
| `app-branch-sort`                   | Interno | Painel de ordenação da aba Almoxarifado (`../lista/app-branch-sort.md`).        |
| `app-branch-repositories`           | Interno | Aba Repositório: vínculos almoxarifado + repositório.                          |
| `app-branch-repository-add`         | Interno | Tela opcional da aba Repositório para adicionar um vínculo.                    |
| `app-branch-stock-partition-picker` | Interno | Campo Almoxarifado da tela de adicionar.                                       |
| `app-branch-repository-picker`      | Interno | Campo Repositório da tela de adicionar.                                        |
| `app-branch-repository-card`        | Interno | Representa um repositório ou um vínculo; repete-se nas listas de repositórios. |
| `app-branch-repository-filter`      | Interno | Painel de filtro das listas de repositórios.                                   |
| `app-branch-repository-sort`        | Interno | Painel de ordenação da aba Repositório.                                        |
| `p-breadcrumb`                      | Externo | Caminho Lista > Página da Filial.                                              |
| `p-tabView`                         | Externo | Abas Cadastro, Almoxarifado e Repositório.                                     |
| `p-confirmDialog`                   | Externo | Confirmações de desvínculo e de saída com edição não salva.                    |
| `p-toast`                           | Externo | Avisos de sucesso, bloqueio e erro.                                            |

### Layout
A página é uma grade de 10 colunas:

1. **Topo (largura toda):** breadcrumb.
2. **Esquerda (2 colunas):** `app-branch-sidebar`, presa ao rolar.
3. **Direita (8 colunas):** abas. Cada aba mostra seu conteúdo abaixo dos títulos:
   - **Cadastro:** `app-branch-register`;
   - **Almoxarifado:** `app-branch-stock-partitions`, com `app-branch-stock-partition-link`, `app-branch-filter` e `app-branch-sort` abrindo entre a barra de ações e a lista;
   - **Repositório:** `app-branch-repositories`, com `app-branch-repository-add`, `app-branch-repository-filter` e `app-branch-repository-sort` abrindo entre a barra de ações e a lista.

Em telas de até 900px, breadcrumb, lateral e abas ficam um embaixo do outro.

### Fluxo entre os componentes

**Carga e cadastro**

- **Dado** a home aberta, **quando** a filial ainda está carregando em `app-branch-detail`,
  **então** `app-branch-sidebar` e `app-branch-register` mostram skeleton; as abas Almoxarifado e
  Repositório, se abertas, mostram o próprio skeleton e buscam os dados assim que a filial chega.
- **Dado** a aba Cadastro em edição, **quando** o usuário salva em `app-branch-register` (saída
  `saved`), **então** `app-branch-detail` passa a filial gravada a `app-branch-sidebar`, que mostra
  os valores novos; se o código mudou, a URL troca para o código novo sem recarregar a página e
  sem deixar o código antigo no histórico. As abas Almoxarifado e Repositório não recarregam.
- **Dado** `app-branch-register` em edição, **quando** o usuário troca de aba, clica em "Lista" no
  breadcrumb ou sai da página, **então** abre o diálogo de saída de `app-branch-register`: "Sair"
  descarta a edição e conclui a ação; "Continuar editando" cancela a ação e mantém a edição.

**Aba Almoxarifado**

- **Dado** a aba Almoxarifado, **quando** o usuário altera o filtro em `app-branch-filter` (saída
  `filterChange`), **então** `app-branch-stock-partitions` guarda o filtro e só o aplica ao clicar
  em "Atualizar".
- **Dado** a aba Almoxarifado, **quando** o usuário muda a ordenação em `app-branch-sort` (saída
  `sortChange`), **então** `app-branch-stock-partitions` reordena na hora e volta à página 1.
- **Dado** a lista de vinculados, **quando** o usuário clica em "Desvincular" em
  `app-branch-stock-partition-card` (saída `unlink`), **então** `app-branch-stock-partitions` inicia
  o desvínculo descrito nos Comportamentos dele.
- **Dado** a seção de vinculação aberta, **quando** o usuário marca ou desmarca um card em
  `app-branch-stock-partition-card` (saída `selectedChange`), **então**
  `app-branch-stock-partition-link` atualiza a seleção e a quantidade no botão "Vincular (n)".
- **Dado** a seção de vinculação aberta, **quando** o usuário clica em "Fechar" em
  `app-branch-stock-partition-link` (saída `closed`), **então** `app-branch-stock-partitions` fecha
  a seção e reabilita a barra de ações e os cards.
- **Dado** almoxarifados marcados, **quando** o vínculo é concluído em
  `app-branch-stock-partition-link` (saída `linked`), **então** `app-branch-stock-partitions` fecha
  a seção e recarrega a lista.

**Aba Repositório**

- **Dado** a aba Repositório, **quando** o usuário altera o filtro em
  `app-branch-repository-filter` ou a ordenação em `app-branch-repository-sort` (saídas
  `filterChange` e `sortChange`), **então** `app-branch-repositories` reage como a aba
  Almoxarifado: o filtro só vale no "Atualizar"; a ordenação vale na hora e volta à página 1.
- **Dado** a lista de vínculos, **quando** o usuário clica em "Desvincular" em
  `app-branch-repository-card` (saída `unlink`), **então** `app-branch-repositories` inicia o
  desvínculo descrito nos Comportamentos dele.
- **Dado** a tela de adicionar aberta, **quando** o usuário clica em "Selecionar" num card de
  `app-branch-stock-partition-picker` ou de `app-branch-repository-picker` (saída `pick` do card),
  **então** o campo guarda a escolha, fecha a seleção e mostra o card escolhido.
- **Dado** nenhum repositório escolhido, **quando** o usuário escolhe ou troca o almoxarifado em
  `app-branch-stock-partition-picker` (saída `selectedChange`), **então**
  `app-branch-repository-add` guarda o almoxarifado e abre a seleção de
  `app-branch-repository-picker`.
- **Dado** a tela de adicionar, **quando** o usuário escolhe, troca ou remove o repositório em
  `app-branch-repository-picker` (saída `selectedChange`), **então** `app-branch-repository-add`
  guarda o repositório e reavalia "Salvar" e o alerta de par já vinculado, usando os vínculos que
  `app-branch-repositories` já carregou.
- **Dado** a tela de adicionar aberta, **quando** o usuário clica em "Cancelar" em
  `app-branch-repository-add` (saída `closed`), **então** `app-branch-repositories` fecha a tela e
  descarta as escolhas.
- **Dado** um par escolhido, **quando** a gravação é concluída em `app-branch-repository-add`
  (saída `added`), **então** `app-branch-repositories` fecha a tela e recarrega a lista.

**Entre as abas**

- **Dado** as duas abas já abertas, **quando** um vínculo muda na aba Almoxarifado (vincular ou
  desvincular almoxarifado), **então** a aba Repositório recarrega, se não estiver carregando.
- **Dado** as duas abas já abertas, **quando** um vínculo muda na aba Repositório (adicionar ou
  desvincular par), **então** a aba Almoxarifado recarrega, se não estiver carregando (adicionar
  um par pode vincular um almoxarifado novo à filial).

### Referências visuais
— (não se aplica)
