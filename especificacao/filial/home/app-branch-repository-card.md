# app-branch-repository-card

### Aplicação
Card que representa um repositório. Mostra os dois campos que identificam o repositório,
que variam conforme o tipo. Na aba Repositório, representa um vínculo (par almoxarifado +
repositório) e mostra também o almoxarifado e o tipo.

### Componentização
| Componente | Tipo    | Onde é usado                                     |
| ---------- | ------- | ------------------------------------------------ |
| `p-button` | Externo | Botões "Desvincular", "Selecionar" e "Abrir"     |

O card tem três variações, definidas por onde é usado:

| Variação  | Onde                                                          | Colunas                                    | Ações                     |
| --------- | ------------------------------------------------------------- | ------------------------------------------ | ------------------------- |
| Vínculo   | Lista da aba Repositório (`app-branch-repositories`)          | Almoxarifado, Tipo e os dois campos do tipo | "Desvincular" e "Abrir"   |
| Escolha   | Lista de `app-branch-repository-picker`                       | Os dois campos do tipo                     | "Selecionar" e "Abrir"    |
| Simples   | Repositório já escolhido em `app-branch-repository-picker`    | Os dois campos do tipo                     | "Abrir"                   |

Campos por tipo de repositório, na ordem das colunas:

| Tipo        | Tag do tipo                       | 1º campo (rótulo · dado)                                  | 2º campo (rótulo · dado)                                   |
| ----------- | --------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| Equipe      | `portal.generic.label.team`       | `iclass.generic.label.login` · login                      | `iclass.generic.label.technician` · nome do técnico         |
| Credenciada | `third.party`                     | `iclass.generic.label.code` · código                      | `portal.generic.label.name` · nome                          |
| Armazém     | `iclass.generic.label.warehouse`  | `iclass.generic.label.code` · código                      | `iclass.generic.label.description` · descrição              |
| Oficina     | `portal.generic.label.workshop`   | `iclass.generic.label.description` · descrição            | `third.party` · credenciada à qual a oficina pertence       |
| Cluster     | `iclass.generic.label.cluster`    | `iclass.generic.label.regional` · regional do cluster     | `portal.generic.label.name` · nome                          |

### Elementos

#### Rótulo "Almoxarifado"
- **Tag:** `iclass.generic.label.stock-partition`
- **CSS:** `.kv-k` (globais)
- **Regras:** só na variação Vínculo.

#### Almoxarifado do vínculo
- **CSS:** `.kv-v` (globais); truncado com reticências, sem tooltip.
- **Regras:** só na variação Vínculo; formato "código - descrição" do almoxarifado (ex.: "Central - Almoxarifado central").
- **Origem do dado:** --

#### Rótulo "Tipo"
- **Tag:** `portal.generic.label.type`
- **CSS:** `.kv-k` (globais)
- **Regras:** só na variação Vínculo.

#### Tipo do repositório
- **Tag:** a tag do tipo (tabela acima)
- **CSS:** `.kv-v` (globais)
- **Regras:** só na variação Vínculo.
- **Origem do dado:** --

#### Rótulo do 1º campo
- **Tag:** conforme o tipo (tabela acima)
- **CSS:** `.kv-k` (globais)

#### Valor do 1º campo
- **CSS:** `.kv-v` (globais); truncado com reticências, sem tooltip.
- **Regras:** sem valor, mostra "—".
- **Origem do dado:** --

#### Rótulo do 2º campo
- **Tag:** conforme o tipo (tabela acima)
- **CSS:** `.kv-k` (globais)

#### Valor do 2º campo
- **CSS:** `.kv-v` (globais); truncado com reticências, sem tooltip.
- **Regras:** sem valor, mostra "—".
- **Origem do dado:** --

#### Botão "Desvincular"
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button` (modo texto)
- **Ícone:** `pi pi-link-slash`
- **CSS:** `btn--md btn--danger btn--text` (globais)
- **Comportamento:** ao clicar, pede o desvínculo do par (ver Fluxo em `README.md`).
- **Regras:** só na variação Vínculo; desabilitado enquanto a tela de adicionar repositório está aberta.

#### Botão "Selecionar"
- **Tag:** `iclass.generic.button.select`
- **Componente:** `p-button`
- **CSS:** `btn--md btn--primary card-actions__pick` (globais)
- **Comportamento:** ao clicar, escolhe este repositório (ver Fluxo em `README.md`).
- **Regras:** só na variação Escolha.

#### Botão "Abrir"
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button` (modo texto)
- **Ícone:** `pi pi-window-maximize`
- **CSS:** `btn--md btn--text icon-neutral` (globais)
- **Comportamento:** ao clicar, abre a home do repositório, conforme o tipo dele (página fora desta especificação; ver Pastas em `../README.md`).
- **Regras:** aparece em todas as variações; na variação Vínculo, desabilitado enquanto a tela de adicionar repositório está aberta.

### Layout
O card é uma linha única, alinhada verticalmente ao centro, com 16px entre as colunas.

- **Variação Vínculo:** Almoxarifado (espaço restante) | Tipo (120px) | 1º campo (180px) | 2º campo (espaço restante) | ações (largura do conteúdo).
- **Variações Escolha e Simples:** 1º campo (220px) | 2º campo (espaço restante) | ações.

Em cada coluna, o rótulo fica acima do valor. As ações ficam alinhadas à direita, com 2px entre
elas. Em telas de até 700px, as colunas de dados dividem a largura em partes iguais, com 10px
entre elas e 12px de margem à esquerda. Altura mínima de 52px.

### Estados
| Estado              | Quando                                              | O que deve ser exibido                                                                    |
| ------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Carregando          | A lista onde o card está é buscada                   | O card inteiro vira um bloco de skeleton de 52px de altura e cantos de 10px; `aria-hidden` |
| Padrão              | Repositório carregado                                | Colunas e ações da variação                                                               |
| Hover/foco          | Cursor sobre o card ou foco em uma ação              | Só o botão sob o cursor muda de fundo; o card não tem destaque próprio           |
| Ações desabilitadas | Variação Vínculo com a tela de adicionar aberta      | "Desvincular" e "Abrir" com opacidade 0,5, sem resposta ao clique                         |

### Comportamentos
— (não se aplica)

### CSS
| Classe                              | Definição                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| .repository-card                    | grid-template-columns: 220px minmax(0, 1fr) auto;<br>min-height: 52px;<br>padding: 6px 12px 6px 20px; |
| .repository-card--link              | grid-template-columns: minmax(0, 1fr) 120px 180px minmax(0, 1fr) auto;                              |
| .card-skeleton                      | height: 52px;<br>border-radius: 10px;                                                              |
| .repository-card (até 700px)        | grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;<br>column-gap: 10px;<br>padding-left: 12px; |
| .repository-card--link (até 700px)  | grid-template-columns: repeat(4, minmax(0, 1fr)) auto;                                              |

Usa também `.reg-card`, `.kv`, `.kv-k`, `.kv-v`, `.skeleton`, `.card-actions` e
`.card-actions__pick` (globais).
