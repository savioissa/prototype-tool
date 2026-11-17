# app-branch-repositories

### Aplicação
Conteúdo da aba Repositório da home da filial. Lista os vínculos da filial, um card por par
almoxarifado + repositório, com filtro, ordenação e paginação, e permite adicionar e desvincular
pares. Segue o mesmo modelo de `app-branch-stock-partitions.md`; este arquivo descreve só o que
é diferente.

### Componentização
| Componente                     | Tipo    | Onde é usado                                                                    |
| ------------------------------ | ------- | ------------------------------------------------------------------------------- |
| `app-branch-repository-add`    | Interno | Tela de adicionar repositório, quando aberta (`app-branch-repository-add.md`)   |
| `app-branch-repository-filter` | Interno | Painel de filtro, variação Completa, quando aberto (`app-branch-repository-filter.md`) |
| `app-branch-repository-sort`   | Interno | Painel de ordenação, quando aberto (`app-branch-repository-sort.md`)            |
| `app-branch-repository-card`   | Interno | Variação Vínculo, um por par da página; 3 em skeleton na carga (`app-branch-repository-card.md`) |
| `p-button`                     | Externo | Barra de ações e "Tentar novamente"                                             |
| `p-paginator`                  | Externo | Paginação                                                                       |
| `p-confirmDialog`              | Externo | Confirmação de desvínculo                                                       |
| `p-toast`                      | Externo | Avisos de desvínculo (toast global da aplicação)                                |

### Elementos

#### Botão "Adicionar"
- **Tag:** `portal.generic.button.add`
- **Componente:** `p-button`
- **Ícone:** `pi pi-plus`
- **CSS:** `btn--md btn--secondary` (globais)
- **Comportamento:** ao clicar, abre ou fecha a tela de adicionar repositório; ao abrir, fecha os painéis de filtro e de ordenação (o filtro aplicado continua valendo).
- **Regras:** destacado (`is-active`) com a tela aberta; desabilitado enquanto a filial carrega.

#### Botões de filtro, de ordenação e "Atualizar"
- **Tag:** filtro e ordenação: — (só ícone, sem tooltip nem `aria-label`); "Atualizar": `portal.generic.button.refresh`.
- **Regras:** iguais aos de `app-branch-stock-partitions.md`, trocando a seção de vinculação pela tela de adicionar repositório.

#### Lista de vínculos
- **Componente:** `app-branch-repository-card`, variação Vínculo, um por par da página
- **CSS:** `.list-stack` (globais)
- **Regras:** um mesmo repositório aparece uma vez por almoxarifado ao qual está vinculado na filial. Ordenação padrão por Tipo repositório, crescente (campos e regra em `app-branch-repository-sort.md`). Buscada só quando a aba é aberta pela primeira vez e mantida ao trocar de aba.
- **Origem do dado:** --

#### Paginador e "Tentar novamente"
- **Regras:** iguais aos de `app-branch-stock-partitions.md` (7 itens por página, só com mais de 7 resultados).

#### Diálogo de desvínculo
- **Regras:** igual ao de `app-branch-stock-partitions.md` (mesmas tags e aparência).

#### Avisos de desvínculo
- **Tag:** sucesso `iclass.generic.label.repository-unlinked-successfully`; bloqueio `iclass.generic.label.cannot-unlink-repository-supplies-pending`; erro `iclass.generic.label.could-not-unlink-repository`.
- **Componente:** `p-toast`
- **Regras:** sucesso por 4 segundos; bloqueio (gravidade aviso) e erro por 6 segundos.

### Layout
Igual ao de `app-branch-stock-partitions.md`, com "Adicionar" no lugar de "Vincular" e a tela de
adicionar repositório no lugar da seção de vinculação.

### Estados
| Estado              | Quando                                                       | O que deve ser exibido                                                                                         |
| ------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Carregando          | Filial ainda carregando, primeira abertura da aba e "Atualizar" | 3 cards em skeleton; `aria-busy`; "Atualizar" desabilitado                                                  |
| Com resultados      | Ao menos um par após o filtro                                | Cards da página e paginador (se houver mais de 7)                                                              |
| Vazio (sem vínculo) | Nenhum par vinculado (ou nenhum, sem filtro ativo)           | Ícone `pi pi-folder-open` e `iclass.generic.label.no-repository-linked`, centralizados (altura mínima de 320px) |
| Sem resultado       | Há pares, há filtro aplicado (tipo ou valor) e nenhum atende  | Ícone `pi pi-search` e `portal.generic.results-not-found`, centralizados                                       |
| Erro                | A busca falhou                                               | Ícone `pi pi-exclamation-circle` em vermelho, `iclass.generic.label.could-not-load-repositories` e "Tentar novamente" |
| Adicionando         | Tela de adicionar repositório aberta                          | Tela acima da lista; filtro, ordenação e "Atualizar" desabilitados; "Desvincular" e "Abrir" dos cards desabilitados |

### Comportamentos
- **Dado** a lista carregada, **quando** o usuário clica em "Desvincular" num card, **então** a
  aba consulta se o repositório ainda tem insumos no almoxarifado do par: se tiver, mostra o
  toast de bloqueio; se não tiver, abre o diálogo de desvínculo. Um segundo clique durante a
  consulta é ignorado.
- **Dado** o diálogo de desvínculo, **quando** o usuário confirma, **então** só esse par é
  desvinculado (o almoxarifado continua vinculado à filial), aparece o toast de sucesso e a lista
  recarrega. Se insumos entraram entre a consulta e a confirmação, aparece o toast de bloqueio;
  outra falha, o toast de erro.

### CSS
Mesmas classes de `app-branch-stock-partitions.md` (a casca usa o mesmo arquivo de estilo).
