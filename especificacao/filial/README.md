# Filial

### Entidade principal e secundárias
| Entidade     | Papel      | Tag                                    | Tradução EN                  |
| ------------ | ---------- | -------------------------------------- | ---------------------------- |
| Filial       | Principal  | `branch`                               | Branch                       |
| Almoxarifado | Secundária | `iclass.generic.label.stock-partition` | Stock partition (revisar)    |
| Repositório  | Secundária | `iclass.generic.label.repository`      | Repository (revisar)         |

### Glossário
| Termo                 | Significado                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Filial                | Unidade da empresa, identificada por código e descrição. É a entidade principal desta especificação.                                              |
| Almoxarifado          | Local de estoque que pode ser vinculado a uma filial. Uma filial tem zero ou mais almoxarifados vinculados.                                         |
| Repositório           | Quem guarda insumos dentro de um almoxarifado. Tem um tipo: Equipe, Credenciada, Armazém, Oficina ou Cluster.                                      |
| Tipo de repositório   | Equipe (técnico, identificado por login), Credenciada (empresa terceira), Armazém, Oficina (pertence a uma credenciada) e Cluster (pertence a uma regional). Cada tipo é identificado por dois campos (ver `home/app-branch-repository-card.md`). |
| Vínculo               | Par almoxarifado + repositório vinculado a uma filial. O mesmo repositório pode ter um vínculo por almoxarifado.                                    |
| Insumo                | Material guardado por um repositório num almoxarifado. Enquanto houver insumo, o vínculo (ou o almoxarifado) não pode ser desvinculado.            |
| Lista                 | Página que lista as filiais cadastradas, com filtro, ordenação e paginação (`/filial`).                                                            |
| Criação               | Página de cadastro de uma nova filial (`/filial/nova`).                                                                                           |
| Home                  | Página de uma filial, aberta a partir da lista, com as abas Cadastro, Almoxarifado e Repositório (`/filial/:codigo`).                              |
| Aba Cadastro          | Aba da home com a leitura e a edição do código e da descrição da filial.                                                                          |
| Aba Almoxarifado      | Aba da home com os almoxarifados vinculados à filial.                                                                                             |
| Aba Repositório       | Aba da home com os vínculos da filial.                                                                                                           |
| Seção de vinculação   | Caixa azul-clara da aba Almoxarifado onde o usuário marca almoxarifados para vincular.                                                            |
| Tela de adicionar repositório | Caixa cinza da aba Repositório onde o usuário escolhe um almoxarifado e um repositório para formar um vínculo.                             |
| Seleção               | Lista aberta dentro de um campo da tela de adicionar repositório, de onde o usuário escolhe um almoxarifado ou um repositório.                     |
| `--` (Origem do dado) | Origem do dado ainda não definida. Por decisão do time, os dados dinâmicos ficam com `--` até o contrato da API existir.                           |

### Pastas
| Pasta   | Componente                          | Papel        | Status   |
| ------- | ----------------------------------- | ------------ | -------- |
| lista   | `app-branch-list`                   | list         | definido |
| lista   | `app-branch-filter`                 | filter       | definido |
| lista   | `app-branch-sort`                   | sort         | definido |
| lista   | `app-branch-card`                   | card         | definido |
| criacao | `app-branch-form`                   | form         | definido |
| criacao | `app-branch-fields`                 | fields       | definido |
| home    | `app-branch-detail`                 | detail       | definido |
| home    | `app-branch-sidebar`                | sidebar      | definido |
| home    | `app-branch-register`               | register     | definido |
| home    | `app-branch-stock-partitions`       | stock-partitions | definido |
| home    | `app-branch-stock-partition-link`   | stock-partition-link | definido |
| home    | `app-branch-stock-partition-card`   | stock-partition-card | definido |
| home    | `app-branch-stock-partition-picker` | stock-partition-picker | definido |
| home    | `app-branch-repositories`           | repositories | definido |
| home    | `app-branch-repository-add`         | repository-add | definido |
| home    | `app-branch-repository-card`        | repository-card | definido |
| home    | `app-branch-repository-filter`      | repository-filter | definido |
| home    | `app-branch-repository-sort`        | repository-sort | definido |
| home    | `app-branch-repository-picker`      | repository-picker | definido |
| —       | Home do almoxarifado (sem seletor na casca) | destino do "Abrir" do almoxarifado | pendente |
| —       | Home do repositório (sem seletor na casca)  | destino do "Abrir" do repositório  | pendente |

### Pendências
— (nenhuma)
