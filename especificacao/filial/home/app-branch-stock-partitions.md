# app-branch-stock-partitions

### Aplicação
Conteúdo da aba Almoxarifado da home da filial. Lista os almoxarifados vinculados à filial, com
filtro, ordenação e paginação, e permite vincular novos almoxarifados e desvincular os atuais.

### Componentização
| Componente                        | Tipo    | Onde é usado                                                              |
| --------------------------------- | ------- | ------------------------------------------------------------------------- |
| `app-branch-stock-partition-link` | Interno | Seção de vinculação, quando aberta (`app-branch-stock-partition-link.md`)  |
| `app-branch-filter`               | Interno | Painel de filtro, quando aberto (`../lista/app-branch-filter.md`)         |
| `app-branch-sort`                 | Interno | Painel de ordenação, quando aberto (`../lista/app-branch-sort.md`)        |
| `app-branch-stock-partition-card` | Interno | Variação Vinculado, um por almoxarifado da página; 3 em skeleton na carga (`app-branch-stock-partition-card.md`) |
| `p-button`                        | Externo | Barra de ações e "Tentar novamente"                                       |
| `p-paginator`                     | Externo | Paginação                                                                 |
| `p-confirmDialog`                 | Externo | Confirmação de desvínculo                                                 |
| `p-toast`                         | Externo | Avisos de desvínculo (toast global da aplicação)                          |

### Elementos

#### Botão "Vincular"
- **Tag:** `portal.generic.button.link`
- **Componente:** `p-button`
- **Ícone:** `pi pi-link`
- **CSS:** `btn--md btn--secondary` (globais)
- **Comportamento:** ao clicar, abre ou fecha a seção de vinculação; ao abrir, fecha os painéis de filtro e de ordenação (o filtro aplicado continua valendo).
- **Regras:** fica destacado (`is-active`) com a seção aberta; desabilitado enquanto a filial carrega.

#### Botão de filtro
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button`
- **Ícone:** `pi pi-filter`
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar, abre ou fecha o painel de filtro.
- **Regras:** destacado só enquanto o painel está aberto; desabilitado com a seção de vinculação aberta.

#### Botão de ordenação
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button`
- **Ícone:** `pi pi-sort-amount-down`
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar, abre ou fecha o painel de ordenação.
- **Regras:** destacado só enquanto o painel está aberto; desabilitado com a seção de vinculação aberta.

#### Botão "Atualizar"
- **Tag:** `portal.generic.button.refresh`
- **Componente:** `p-button`
- **Ícone:** `pi pi-refresh`
- **CSS:** `btn--md btn--primary` (globais)
- **Comportamento:** ao clicar, recarrega os almoxarifados vinculados aplicando o filtro preenchido no painel, mantém a ordenação e volta à página 1.
- **Regras:** desabilitado durante a carga e com a seção de vinculação aberta.

#### Lista de almoxarifados vinculados
- **Componente:** `app-branch-stock-partition-card`, variação Vinculado, um por almoxarifado da página
- **CSS:** `.list-stack` (globais)
- **Regras:** ordenação padrão por Descrição, crescente (campos e direção em `../lista/app-branch-sort.md`). A lista é buscada só quando a aba é aberta pela primeira vez e é mantida ao trocar de aba.
- **Origem do dado:** --

#### Paginador
- **Componente:** `p-paginator`
- **CSS:** `paginator--md` (globais)
- **Comportamento:** ao trocar de página, mostra os almoxarifados da página escolhida.
- **Regras:** 7 itens por página; até 5 números de página; só aparece com mais de 7 resultados; volta à página 1 ao ordenar e ao atualizar.

#### Botão "Tentar novamente"
- **Tag:** `portal.generic.button.try-again`
- **Componente:** `p-button`
- **Ícone:** `pi pi-refresh`
- **CSS:** `btn--md btn--secondary` (globais)
- **Comportamento:** ao clicar, recarrega a lista.
- **Regras:** só aparece no estado Erro.

#### Diálogo de desvínculo
- **Tag:** título `portal.model.tree.label.attention`; mensagem `iclass.generic.label.confirm-unlink`; botões `portal.generic.button.unlink` e `portal.generic.button.cancel`.
- **Componente:** `p-confirmDialog`, com título
- **CSS:** `leave-dialog leave-dialog--titled` (globais); 420px de largura. "Desvincular" `btn--md btn--danger`; "Cancelar" `btn--md btn--neutral` (globais); sem ícones.
- **Comportamento:** "Desvincular" desvincula o almoxarifado da filial; "Cancelar" fecha sem mudar nada.
- **Regras:** ao abrir, o foco fica em "Cancelar".

#### Avisos de desvínculo
- **Tag:** sucesso `iclass.generic.label.stock-partition-unlinked-successfully`; bloqueio `iclass.generic.label.cannot-unlink-stock-partition-repository-linked`; erro `iclass.generic.label.could-not-unlink-stock-partition`.
- **Componente:** `p-toast`
- **Regras:** sucesso por 4 segundos; bloqueio (gravidade aviso) e erro por 6 segundos.

### Layout
Uma coluna com 12px entre os blocos e altura mínima da área da aba:

1. **Barra de ações (alinhada à direita, 8px entre botões, quebra linha se faltar espaço):** "Vincular", filtro, ordenação e "Atualizar".
2. **Seção de vinculação**, quando aberta.
3. **Painel de filtro**, quando aberto.
4. **Painel de ordenação**, quando aberto.
5. **Lista** ou estado, e **paginador**.

### Estados
| Estado                 | Quando                                                       | O que deve ser exibido                                                                                                      |
| ---------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Carregando             | Filial ainda carregando, primeira abertura da aba e "Atualizar" | 3 cards em skeleton; `aria-busy`; "Atualizar" desabilitado                                                               |
| Com resultados         | Ao menos um almoxarifado após o filtro                       | Cards da página e paginador (se houver mais de 7)                                                                           |
| Vazio (sem vínculo)    | Nenhum almoxarifado vinculado (ou nenhum, sem filtro com valor) | Ícone `pi pi-folder-open` e `iclass.generic.label.no-stock-partition-linked`, centralizados (altura mínima de 320px)     |
| Sem resultado          | Há vinculados, há filtro aplicado com valor e nenhum atende   | Ícone `pi pi-search` e `portal.generic.results-not-found`, centralizados                                                    |
| Erro                   | A busca falhou                                               | Ícone `pi pi-exclamation-circle` em vermelho, `iclass.generic.label.could-not-load-stock-partitions` e "Tentar novamente"     |
| Vinculando             | Seção de vinculação aberta                                    | Seção acima da lista; filtro, ordenação e "Atualizar" desabilitados; "Desvincular" e "Abrir" dos cards desabilitados          |

### Comportamentos
- **Dado** a lista carregada, **quando** o usuário clica em "Desvincular" num card, **então** a
  aba consulta se algum repositório da filial está vinculado a esse almoxarifado (na aba
  Repositório): se estiver, mostra o toast de bloqueio e não desvincula; se não estiver, abre o
  diálogo de desvínculo. Um
  segundo clique durante a consulta é ignorado.
- **Dado** o diálogo de desvínculo, **quando** o usuário confirma, **então** o almoxarifado é
  desvinculado, aparece o toast de sucesso e a lista recarrega. Se um repositório foi vinculado a
  ele entre a consulta e a confirmação, aparece o toast de bloqueio; outra falha, o toast de erro.

### CSS
| Classe                  | Definição                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------- |
| :host                   | display: flex;<br>flex-direction: column;<br>gap: 12px;<br>min-height: 100%;        |
| .tab-toolbar            | display: flex;<br>justify-content: flex-end;<br>flex-wrap: wrap;<br>gap: 8px;       |
| .req-empty.state-fill   | min-height: 320px;                                                                 |

Usa também `.list-stack`, `.req-empty`, `.load-state`, `.load-state--error`, `.state-fill`,
`.is-active`, `.paginator--md`, `.leave-dialog` e `.leave-dialog--titled` (globais).
