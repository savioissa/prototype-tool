# 01 — Moldura e aba Principal

## Moldura

A moldura é o componente raiz visual: menu lateral à esquerda e área de conteúdo à direita.
Ocupa a janela inteira (`100vh`), sem rolagem própria; quem rola é a área de conteúdo.

### Menu lateral

| Ordem | Rótulo | Ícone (PrimeIcons) | Destino |
|---|---|---|---|
| 1 | Principal | `pi-desktop` | URL da tela atual, ou `/` se ainda não houver |
| 2 | Área de teste | `pi-box` | `/_proto/teste` |
| 3 | Dados | `pi-sitemap` | `/_proto/dados` |
| 4 | Traduções | `pi-language` | `/_proto/traducoes` |

- Dois tamanhos: expandido (220px, ícone + rótulo) e recolhido (56px, só ícone, com o
  rótulo em tooltip). Um botão no rodapé do menu alterna entre os dois.
- O item ativo fica destacado. "Principal" é o ativo sempre que a URL não começa com
  `/_proto`.
- Visual neutro, usando as variáveis de cor do tema PrimeNG do projeto. O menu não deve
  chamar mais atenção do que a tela.

### Rotas

A moldura entra por uma única função, chamada no arquivo de rotas do app:

```ts
// app.routes.ts
export const routes: Routes = comPrototipador(rotasDasTelas);
```

`comPrototipador` devolve esta árvore:

```
'' → MolduraComponent
├─ '_proto/teste'      → área de teste (carregamento sob demanda)
├─ '_proto/dados'      → dados (carregamento sob demanda)
├─ '_proto/traducoes'  → traduções (carregamento sob demanda)
└─ ''                  → PrincipalComponent
   └─ ...rotasDasTelas (inalteradas)
```

- As rotas `_proto/*` vêm antes das rotas das telas, para que um `**` das telas não as
  capture.
- As rotas das telas não mudam: mesmas URLs, guards, resolvers e carregamento sob demanda.
- Remover o prototipador do projeto é desfazer essa chamada e apagar a pasta.

## Aba Principal

Mostra a tela rodando normalmente, com uma barra fina (40px) no topo e a tela logo abaixo.

A barra tem dois controles, e só dois:

| Controle | Tipo | Opções | Efeito |
|---|---|---|---|
| Idioma | seleção única (botões lado a lado) | PT · EN · ES | Troca o idioma da tela |
| Exibir tags | chave liga/desliga | ligado · desligado | Troca cada texto traduzido pela sua chave |

### Idioma

- Aplica a troca pelo serviço de tradução do projeto (`use(...)`).
- Os códigos de idioma são os que o projeto já usa; ficam numa constante em
  `principal/idiomas.ts` e devem bater com `i18n.idiomas` do `prototipador.config.json`.
- O idioma escolhido vale para a aplicação inteira, inclusive para o componente exibido na
  área de teste.
- Com "Exibir tags" ligado, o seletor de idioma fica desabilitado (o idioma escolhido é
  mantido e volta a valer ao desligar).

### Exibir tags

Com a chave ligada, todo texto que passa pelo serviço de tradução aparece como a própria
chave (ex.: `generic.label.branch`), no lugar exato em que o texto apareceria.

Como fazer:

- Registre um pseudo-idioma `proto-tags`.
- Envolva o carregador de traduções que o projeto já usa (não o substitua). Para qualquer
  idioma real, o carregador delega ao original. Para `proto-tags`, ele carrega os três
  idiomas pelo original, une as chaves e devolve a mesma estrutura com cada valor trocado
  pelo caminho completo da chave.
- Funciona com arquivos de chaves aninhadas e de chaves planas.
- Não dependa do comportamento de "tradução ausente devolve a chave": se o projeto tiver
  idioma de reserva configurado, o texto de reserva apareceria no lugar da chave.

Consequência útil, que não exige código: no modo "exibir tags", o que continuar aparecendo
como texto legível é dado mockado ou texto fixo sem tag.

### Estado guardado

Tudo em `localStorage`, para sobreviver ao recarregamento automático:

| Chave | Conteúdo | Valor inicial |
|---|---|---|
| `proto.menuRecolhido` | booleano | `false` |
| `proto.idioma` | `pt`, `en` ou `es` | idioma atual do projeto |
| `proto.exibirTags` | booleano | `false` |
| `proto.telaAtual` | ver abaixo | vazio |

## Tela atual

Um serviço acompanha a navegação e guarda a tela atual.

- A cada navegação concluída cuja URL **não** começa com `/_proto`, o serviço guarda:
  - `url`: a URL completa;
  - `idsRaiz`: os identificadores dos componentes ligados às rotas ativas. Percorra a árvore
    de rotas ativas e, para cada componente, leia o seletor com `reflectComponentType`; se
    o componente não tiver seletor próprio, use o nome da classe. É a mesma regra do campo
    `id` do registro de componentes (`05-gerador.md`). Ignore os componentes do
    prototipador.
- Navegar para `/_proto/*` não altera a tela atual.
- As outras abas obtêm os **componentes da tela atual** partindo de `idsRaiz` e
  seguindo o campo `filhos` do registro de componentes (`05-gerador.md`) até não haver
  novos.
- Se não houver tela atual (primeiro acesso direto a uma aba `_proto`), as abas de teste e
  traduções mostram todos os componentes e tags do projeto.

## Limitações conhecidas

Não tente contornar estas situações alterando a tela. Se acontecerem, relate ao usuário.

- **Tela que usa `100vh` ou `position: fixed`** considera a janela inteira, não a área de
  conteúdo. Pode ser atenuado aplicando `contain: layout` no contêiner da tela, o que faz
  dele a referência para elementos fixos. Teste com um diálogo e um menu suspenso do
  PrimeNG antes de adotar.
- **Texto traduzido uma única vez no código** (ex.: itens de menu montados na
  inicialização) não muda ao trocar o idioma nem ao ligar "exibir tags". É comportamento da
  tela.

## Critérios de aceite

1. Com o prototipador instalado, todas as rotas das telas respondem nas mesmas URLs de antes.
2. Os 4 itens do menu navegam para os destinos da tabela; o item ativo fica destacado.
3. Recolher o menu, recarregar a página: o menu continua recolhido.
4. Trocar para EN e ES muda os textos traduzidos da tela; recarregar mantém o idioma.
5. Ligar "exibir tags" troca os textos traduzidos pelas chaves; desligar volta ao idioma
   anterior.
6. Abrir uma tela, ir para `/_proto/teste` e clicar em "Principal" volta para a mesma URL.
7. Nenhum arquivo dentro da pasta das telas foi alterado.
