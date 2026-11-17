# app-branch-stock-partition-picker

### Aplicação
Campo obrigatório "Almoxarifado" da tela de adicionar repositório. Permite escolher um
almoxarifado entre todos os do sistema, trocar a escolha ou desfazê-la.

### Componentização
| Componente                        | Tipo    | Onde é usado                                                               |
| --------------------------------- | ------- | -------------------------------------------------------------------------- |
| `app-branch-filter`               | Interno | Painel de filtro, quando aberto na seleção (`../lista/app-branch-filter.md`) |
| `app-branch-stock-partition-card` | Interno | Variação Escolha: um por almoxarifado da página; variação Simples: o escolhido (`app-branch-stock-partition-card.md`) |
| `p-button`                        | Externo | "Alterar", "Remover", filtro, atualizar e "Fechar"                         |
| `p-paginator`                     | Externo | Paginação da seleção                                                       |

### Elementos

#### Rótulo "Almoxarifado"
- **Tag:** `iclass.generic.label.stock-partition`, seguido de um asterisco vermelho (`aria-hidden`).
- **CSS:** `.t-label-field` (globais) `.pick-field__label`; asterisco `.pick-field__required`; h3.

#### Botão "Alterar"
- **Tag:** `portal.generic.button.change`
- **Componente:** `p-button` (modo texto)
- **CSS:** `btn--md pick-field__action`; 28px de altura, fonte 14px.
- **Comportamento:** ao clicar, abre a seleção no lugar do card escolhido; a escolha atual continua valendo até outra ser feita.
- **Regras:** só aparece com um almoxarifado escolhido e a seleção fechada; à direita do rótulo.

#### Botão "Remover"
- **Tag:** `iclass.generic.button.remove`
- **Componente:** `p-button` (modo texto)
- **CSS:** `btn--md btn--danger btn--text` (globais) `pick-field__action`; vermelho.
- **Comportamento:** ao clicar, desfaz a escolha e volta à área clicável.
- **Regras:** mesmas condições de "Alterar".

#### Área clicável "Selecionar almoxarifado"
- **Tag:** `iclass.generic.label.select-stock-partition`
- **Ícone:** `pi pi-plus`
- **CSS:** `.pick-area`; borda tracejada, texto azul `#2563EB`; ao passar o mouse, borda e fundo azul-claros; foco com contorno azul.
- **Comportamento:** ao clicar, abre a seleção no lugar da área.
- **Regras:** só aparece sem escolha e com a seleção fechada.

#### Card do almoxarifado escolhido
- **Componente:** `app-branch-stock-partition-card`, variação Simples
- **Regras:** só aparece com um almoxarifado escolhido e a seleção fechada.

#### Título da seleção
- **Tag:** `iclass.generic.label.select-stock-partition`
- **CSS:** `.pick-section__title`; h4.

#### Botão de filtro
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button`
- **Ícone:** `pi pi-filter`
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar, abre ou fecha o painel de filtro da seleção.
- **Regras:** com o painel aberto, fica destacado (`is-active`, globais).

#### Botão de atualizar
- **Tag:** — (só ícone, sem tooltip nem `aria-label`)
- **Componente:** `p-button`
- **Ícone:** `pi pi-refresh`
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar, recarrega os almoxarifados aplicando o filtro preenchido no painel e volta à página 1.
- **Regras:** desabilitado durante a carga.

#### Lista de almoxarifados
- **Componente:** `app-branch-stock-partition-card`, variação Escolha, um por almoxarifado da página
- **CSS:** `.list-stack` (globais)
- **Regras:** mostra todos os almoxarifados do sistema, inclusive os já vinculados à filial; ordem fixa por Descrição, crescente, sem diferenciar maiúsculas e acentos.
- **Origem do dado:** --

#### Botão "Fechar"
- **Tag:** `portal.generic.button.close`
- **Componente:** `p-button`
- **CSS:** `btn--md btn--neutral` (globais)
- **Comportamento:** ao clicar, fecha a seleção sem mudar a escolha: volta ao card escolhido ou à área clicável.

#### Paginador
- **Componente:** `p-paginator`
- **CSS:** `paginator--md` (globais); sem borda e sem respiro, na linha do "Fechar".
- **Comportamento:** ao trocar de página, mostra os almoxarifados da página escolhida.
- **Regras:** 3 itens por página; até 5 números de página; só aparece com mais de 3 resultados e fora da carga; volta à página 1 ao atualizar.

### Layout
Uma coluna com 6px entre os blocos:

1. **Cabeçalho (altura mínima de 32px):** rótulo à esquerda; "Alterar" e "Remover" à direita, quando aparecem.
2. **Conteúdo:** um destes três, no mesmo lugar:
   - **Seleção aberta:** caixa azul-clara (`.pick-section`) com cabeçalho (título à esquerda; filtro e atualizar à direita), painel de filtro, lista e rodapé ("Fechar" à esquerda e paginador à direita, na mesma linha), com 12px entre eles;
   - **Escolhido:** card do almoxarifado;
   - **Sem escolha:** área clicável de 72px de altura.

### Estados
| Estado               | Quando                                                     | O que deve ser exibido                                                                                                  |
| -------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Seleção aberta       | Ao abrir a tela de adicionar repositório, e ao clicar na área ou em "Alterar" | Caixa da seleção com a lista                                                                    |
| Carregando           | Os almoxarifados estão sendo buscados                       | 3 cards em skeleton; `aria-busy`; atualizar desabilitado                                                                 |
| Com resultados       | Há almoxarifado após o filtro                               | Cards da página e paginador (se houver mais de 3)                                                                        |
| Vazio (sem cadastro) | Nenhum almoxarifado no sistema                              | Ícone `pi pi-folder-open` e `iclass.generic.label.no-stock-partition-registered` (`.load-state`, globais)                 |
| Sem resultado        | Há almoxarifados, há filtro ativo e nenhum atende           | Ícone `pi pi-search` e `portal.generic.results-not-found` (`.load-state`, globais)                                       |
| Erro                 | A busca falhou                                              | Ícone `pi pi-exclamation-circle` em vermelho, `iclass.generic.label.could-not-load-stock-partitions` e o botão `portal.generic.button.try-again` (`btn--md btn--secondary`, ícone `pi pi-refresh`), que recarrega (`.load-state--error`, globais) |
| Sem escolha          | Seleção fechada, nada escolhido                             | Área clicável                                                                                                            |
| Escolhido            | Seleção fechada, almoxarifado escolhido                     | "Alterar", "Remover" e o card do almoxarifado                                                                            |

### Comportamentos
- **Dado** a seleção aberta, **quando** o usuário altera o filtro no painel, **então** a lista só
  muda ao clicar no botão de atualizar.
- **Dado** a tela reaberta com um almoxarifado já escolhido, **quando** o campo aparece, **então**
  mostra o card escolhido em vez da seleção.

### CSS
| Classe                     | Definição                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| .pick-field                | display: flex;<br>flex-direction: column;<br>gap: 6px;                                                                                              |
| .pick-field__header        | display: flex;<br>align-items: center;<br>gap: 12px;<br>min-height: 32px;                                                                           |
| .pick-field__label         | margin: 0;<br>color: #1F2937;                                                                                                                     |
| .p-button.btn--md.pick-field__action | height: 28px;<br>padding: 0 10px;<br>font-size: 14px;                                                                                   |
| .pick-field__required      | margin-left: 2px;<br>color: #DC2626;                                                                                                              |
| .pick-area                 | display: flex;<br>align-items: center;<br>justify-content: center;<br>gap: 8px;<br>width: 100%;<br>height: 72px;<br>padding: 0 16px;<br>border: 1px dashed #C9CCDA;<br>border-radius: 8px;<br>background: #F9FAFC;<br>color: #2563EB;<br>font: inherit;<br>font-size: 14px;<br>font-weight: 500;<br>cursor: pointer; |
| .pick-area .pi             | font-size: 14px;                                                                                                                                  |
| .pick-area:hover           | border-color: #93C5FD;<br>background: #F1F6FF;                                                                                                    |
| .pick-area:focus-visible   | outline: 2px solid #60A5FA;<br>outline-offset: 2px;                                                                                               |
| .pick-section              | display: flex;<br>flex-direction: column;<br>gap: 12px;<br>padding: 12px 16px 16px;<br>background: #F6FAFF;<br>border: 1px solid #C6DFFF;<br>border-radius: 10px; |
| .pick-section__header      | display: flex;<br>align-items: center;<br>flex-wrap: wrap;<br>gap: 12px;                                                                            |
| .pick-section__title       | margin: 0;<br>font: var(--label-field);<br>color: #1F2937;                                                                                        |
| .pick-section__tools       | display: flex;<br>gap: 8px;<br>margin-left: auto;                                                                                                 |
| .pick-section__footer      | display: flex;<br>align-items: center;<br>gap: 12px;                                                                                                |
| .pick-section__footer p-paginator | flex: 1;<br>min-width: 0;                                                                                                                  |
| .pick-section__footer .p-paginator | padding: 0;<br>border: none;                                                                                                             |

Usa também `.t-label-field`, `.list-stack`, `.load-state`, `.load-state--error`, `.is-active` e
`.paginator--md` (globais).
