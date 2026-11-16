# 02 — Área de teste

## Propósito

Isolar um componente da tela, escolher uma variação e alterar os dados para ver como ele se
comporta, incluindo com dados de tamanho mínimo e máximo.

## Layout

```
┌──────────────┬───────────────────────────────┬──────────────────┐
│ Componentes  │ Palco                         │ Controles        │
│              │                               │                  │
│ [Tela atual│ │   (componente isolado)        │ Variação  [▾]    │
│  Todos]      │                               │ [Restaurar]      │
│              │                               │                  │
│ ▸ grupo      │                               │ (formulário dos  │
│   componente ├───────────────────────────────┤  inputs)         │
│   componente │ Eventos emitidos              │                  │
└──────────────┴───────────────────────────────┴──────────────────┘
```

| Área | Largura | Conteúdo |
|---|---|---|
| Componentes | 240px | Lista dos componentes, agrupados |
| Palco | o que sobrar | O componente escolhido, renderizado sozinho |
| Eventos emitidos | altura 160px, recolhível | Registro dos outputs disparados |
| Controles | 340px | Seletor de variação e formulário dos inputs |

## Lista de componentes

- Fonte: o registro de componentes gerado (`05-gerador.md`).
- Alternador **Tela atual · Todos**. "Tela atual" (padrão) mostra só os componentes da tela
  atual; "Todos" mostra todos os componentes da pasta das telas.
- Agrupamento: pelo `grupo` do arquivo de ajuste; sem ajuste, pela pasta do componente
  relativa à pasta das telas.
- Cada item mostra o identificador do componente (o seletor ou, se não houver, o nome da
  classe). Um ícone de alerta indica que o componente tem
  avisos (ex.: input não editável sem ajuste).
- O componente e a variação escolhidos ficam na URL (`?c=<identificador>&v=<variação>`), para
  sobreviver ao recarregamento automático e permitir compartilhar o link.

## Palco

- Cria o componente dinamicamente (`ViewContainerRef.createComponent`) e aplica os valores
  com `setInput`, que serve tanto para inputs por decorator quanto por signal.
- **Só aplica os inputs que a variação define ou que o usuário editou.** Os demais ficam
  com o valor padrão do próprio componente.
- O componente fica dentro de um contêiner com a `largura` do ajuste (padrão: 100% do
  palco), sobre o fundo padrão da aplicação.
- Se o componente falhar ao ser criado ou atualizado, o palco mostra a mensagem do erro e a
  orientação "Este componente precisa de um arquivo de ajuste" em vez de quebrar a aba.
- Trocar de componente destrói o anterior.

## Eventos emitidos

- Ao criar o componente, assina todos os outputs do registro.
- Cada disparo vira uma linha: hora (`HH:mm:ss`), nome do output e o valor emitido em JSON
  resumido (até 200 caracteres).
- Mais recentes no topo, no máximo 50 linhas, com botão "Limpar".

## Variações

- Sem arquivo de ajuste: existe só a variação **Padrão**, que não define nenhum input.
- Com variações no arquivo de ajuste: elas substituem a Padrão, na ordem em que foram
  escritas; a primeira é a inicial.
- Trocar de variação descarta as edições do formulário e aplica os valores da nova.

## Formulário dos inputs

Gerado a partir dos inputs do registro, um campo por input, na ordem do componente. Parte
dos valores da variação escolhida.

| Tipo do input | Controle | Observações |
|---|---|---|
| `texto` | área de texto de 1 linha que cresce | Contador de caracteres abaixo do campo |
| `numero` | campo numérico | — |
| `booleano` | chave liga/desliga | — |
| `opcoes` | dropdown | Uma opção por valor do tipo |
| `data` | calendário | — |
| `objeto` | grupo recolhível, um campo por atributo | Recursivo |
| `lista` | itens numerados, com "Adicionar" e remover por item | Cada item segue o tipo do item |
| `naoEditavel` | texto do tipo + aviso | "Defina este input no arquivo de ajuste" |

Regras:

- **Aplicação imediata.** Cada edição é aplicada ao componente após 150ms sem digitar.
- **Contador e limites.** Todo campo de texto mostra a quantidade de caracteres. Se o
  ajuste declarar limite, mostra `23/60` e destaca o contador quando o valor sai do
  intervalo. **O limite nunca bloqueia a digitação**: o objetivo é justamente ver o
  componente com dados fora do esperado. Limites em número comparam o valor; em lista, a
  quantidade de itens.
- **Vazio, indefinido e nulo são diferentes.** Todo campo opcional tem a ação "Deixar
  indefinido". Se o tipo aceitar nulo, tem também "Definir como nulo". Um campo de texto
  apagado vale texto vazio.
- **Restaurar.** Botão que descarta as edições e reaplica a variação.
- **Edições guardadas.** Os valores editados ficam em `sessionStorage`, por componente e
  variação, para sobreviver ao recarregamento automático. "Restaurar" e trocar de variação
  apagam o que foi guardado.
- Use os componentes de formulário do PrimeNG na versão instalada no projeto.

## Arquivo de ajuste

Opcional. Fica ao lado do componente, com o mesmo nome e a extensão `.proto.ts`. O gerador
o encontra pelo nome e o liga ao componente.

```ts
// branch-card.proto.ts
import { ajustar } from '<caminho>/prototipador/teste/ajustar';
import { BranchCardComponent } from './branch-card.component';

export default ajustar(BranchCardComponent, {
  grupo: 'Filial · Lista',
  largura: 360,
  variacoes: {
    'Ativa':      { branch: { name: 'Filial Centro', status: 'active' } },
    'Inativa':    { branch: { name: 'Filial Sul', status: 'inactive' } },
    'Carregando': { loading: true },
  },
  limites: {
    'branch.name': { min: 1, max: 60 },
  },
});
```

| Campo | Tipo | Para que serve |
|---|---|---|
| `grupo` | texto | Nome do grupo na lista de componentes |
| `largura` | número (px) ou texto CSS | Largura do contêiner no palco |
| `variacoes` | nome → valores dos inputs | Estados e variações selecionáveis |
| `limites` | caminho → `{ min?, max? }` | Tamanhos esperados; aparecem no contador |
| `tipos` | caminho → tipo de campo | Corrige um input que o gerador marcou como não editável |
| `provedores` | lista de providers | Dependências que o componente recebe do pai ou da rota |
| `conteudo` | texto | Conteúdo projetado, para componentes com `<ng-content>` |

- `ajustar` só devolve o que recebe; existe para dar tipagem e um ponto único de leitura.
- O **caminho** usa ponto para atributos (`branch.name`) e `[]` para itens de lista
  (`branches[].name`).
- Nome de input que não existe no componente gera um aviso no console e é ignorado.
- Os arquivos `*.proto.ts` são a única exceção à regra de que as telas não importam o
  prototipador. Eles são removidos junto com ele.

## Critérios de aceite

1. Um componente novo criado na pasta das telas aparece na lista sem nenhum cadastro.
2. Um componente sem arquivo de ajuste renderiza na variação Padrão, ou mostra a mensagem
   de erro orientando o ajuste; a aba nunca quebra.
3. Editar um campo de texto atualiza o componente no palco e o contador de caracteres.
4. Colar um texto de 500 caracteres num campo com limite 60 é aceito, e o contador fica
   destacado.
5. Trocar de variação aplica os novos valores; "Restaurar" desfaz as edições.
6. Clicar num botão do componente que dispara um output adiciona uma linha em "Eventos
   emitidos".
7. Salvar qualquer arquivo (recarregamento automático) mantém o componente, a variação e as
   edições.
8. Trocar o idioma na aba Principal muda os textos do componente no palco.
