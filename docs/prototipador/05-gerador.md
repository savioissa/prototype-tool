# 05 — Gerador

## Propósito

Ler o código das telas e escrever três arquivos que as abas exibem. É um script Node em
TypeScript; não faz parte do bundle da aplicação.

| Arquivo gerado | Conteúdo | Usado por |
|---|---|---|
| `gerado/componentes.gerado.ts` | Registro de componentes: inputs, outputs, filhos, importação | Área de teste; cálculo da tela atual |
| `gerado/schema.gerado.ts` | Entidades, atributos e relacionamentos inferidos | Dados |
| `gerado/tags.gerado.ts` | Tags usadas, textos, status e contextos | Traduções |

## Regras gerais

- **Nunca interrompe.** Um arquivo que não pôde ser lido vira um aviso (texto com o caminho
  do arquivo e o motivo) e a geração continua. Os avisos vão dentro do arquivo gerado
  correspondente.
- **Saída estável.** Listas ordenadas (componentes por identificador, entidades por nome,
  tags por chave). O arquivo só é reescrito se o conteúdo mudou, para não provocar
  recarregamentos à toa.
- **Só lê o que a configuração aponta**: `pastaTelas`, `mocks`, `i18n` e `planilha`. Nunca
  lê a pasta do prototipador.
- **Cabeçalho** em todo arquivo gerado: `// ARQUIVO GERADO. Não edite.`
- Ao terminar, imprime uma linha: quantidades de componentes, entidades, tags e avisos, e o
  tempo gasto.

## Execução

Scripts no `package.json` (preserve opções que o `start` atual já tiver):

```json
{
  "proto:gerar": "tsx src/app/prototipador/gerador/main.ts",
  "proto:observar": "tsx src/app/prototipador/gerador/main.ts --observar",
  "proto:testar": "tsx --test src/app/prototipador/gerador/testes/*.test.ts",
  "prestart": "npm run proto:gerar",
  "start": "concurrently -k -n gerador,angular \"npm:proto:observar\" \"ng serve\"",
  "prebuild": "npm run proto:gerar"
}
```

- **Modo observação:** vigia `pastaTelas`, a pasta i18n, o CSV e o arquivo de configuração.
  A cada alteração, espera 300ms sem novas alterações e roda uma geração completa **num
  processo filho**, para que os mocks sejam recarregados do zero.
- Geração completa a cada alteração é suficiente para um protótipo. Só otimize se uma
  geração passar de 3 segundos num projeto real, e avise o usuário antes.

Dependências de desenvolvimento: `ts-morph` (leitura de classes e tipos), `tsx` (execução),
`chokidar` (observação), `concurrently` (dois processos no `start`), `csv-parse` (planilha).
Os templates são lidos com `@angular/compiler`, que o projeto já tem. Dependência de
execução: `mermaid` (só a aba de dados).

A pasta `gerador/` tem `tsconfig.json` próprio. Confirme que o `tsconfig.app.json` e o de
testes do projeto não a incluem.

## Modelo

Os tipos ficam em `src/app/prototipador/modelo/tipos.ts`, sem imports do Angular nem do
Node. Este é o contrato entre o gerador e a interface.

```ts
// ---------- Componentes ----------

export type TipoCampo =
  | { tipo: 'texto' }
  | { tipo: 'numero' }
  | { tipo: 'booleano' }
  | { tipo: 'data' }
  | { tipo: 'opcoes'; valores: (string | number)[] }
  | { tipo: 'objeto'; campos: Campo[] }
  | { tipo: 'lista'; item: TipoCampo }
  | { tipo: 'naoEditavel'; textoDoTipo: string; motivo: string };

export interface Campo {
  nome: string;
  tipo: TipoCampo;
  opcional: boolean;      // pode ficar indefinido
  aceitaNulo: boolean;
}

export interface InputRegistrado extends Campo {
  // `nome` é o nome público (o alias, se houver): é o que se passa ao setInput
  propriedade: string;    // nome da propriedade na classe
  padrao?: unknown;       // só quando o valor inicial é um literal
}

export interface OutputRegistrado {
  nome: string;           // nome público
  propriedade: string;
}

export interface ComponenteRegistrado {
  id: string;             // o seletor; se não houver, o nome da classe
  seletor: string | null;
  classe: string;
  arquivo: string;        // caminho relativo à raiz do projeto
  pasta: string;          // relativa a pastaTelas; grupo padrão na área de teste
  standalone: boolean;
  inputs: InputRegistrado[];
  outputs: OutputRegistrado[];
  filhos: string[];       // ids dos componentes do projeto usados no template
  carregar: () => Promise<unknown>;        // devolve a classe do componente
  ajuste: (() => Promise<unknown>) | null; // devolve o export default do .proto.ts
  avisos: string[];
}

// ---------- Schema ----------

export type TipoObservado = 'texto' | 'numero' | 'booleano' | 'data';

export interface Atributo {
  nome: string;
  tipos: TipoObservado[];
  opcional: boolean;
  exemplo: string | null;
  marca: 'PK' | 'FK' | null;
}

export interface Entidade {
  nome: string;
  origens: { arquivo: string; exportacao: string }[];
  registros: number;
  atributos: Atributo[];
}

export interface Relacionamento {
  de: string;
  para: string;
  cardinalidade: '1:1' | '1:N' | 'N:1' | 'N:N';
  regra: 'aninhado' | 'listaAninhada' | 'referencia' | 'listaDeReferencias';
  campo: string;
  confianca: 'alta' | 'baixa';
}

export interface SchemaGerado {
  entidades: Entidade[];
  relacionamentos: Relacionamento[];
  avisos: string[];
}

// ---------- Tags ----------

export interface UsoDeTag {
  componente: string;     // id do componente
  arquivo: string;
  linha: number;
  papel: string;          // ex.: "rótulo do botão"
  condicao: string | null;
  trecho: string;
  provavel: boolean;      // true = texto fixo no .ts idêntico a uma chave
}

export interface TagUsada {
  chave: string;
  textos: { pt?: string; en?: string; es?: string };
  naPlanilha: boolean | null;   // null = planilha indisponível
  usos: UsoDeTag[];
}

export interface ChaveDinamica extends Omit<UsoDeTag, 'provavel'> {
  expressao: string;
}

export interface TagsGeradas {
  tags: TagUsada[];
  dinamicas: ChaveDinamica[];
  planilhaDisponivel: boolean;
  avisos: string[];
}
```

## Leitura dos componentes

Para cada classe com `@Component` dentro de `pastaTelas`:

**Inputs.** Reconheça todas estas formas, inclusive as herdadas de classe base:

| Forma | Nome público | Opcional |
|---|---|---|
| `@Input() x` | `x` | sim |
| `@Input('alias') x` ou `@Input({ alias })` | o alias | sim |
| `@Input({ required: true }) x` | `x` | não |
| `@Input() set x(v: T)` | `x` (tipo do parâmetro) | sim |
| `x = input<T>()` ou `input(valorInicial)` | `x` (ou o alias das opções) | sim |
| `x = input.required<T>()` | `x` | não |
| `x = model<T>()` | `x` (também é output `xChange`) | sim |

Inputs declarados só no metadado (`inputs: [...]`) ou vindos de `hostDirectives` não são
lidos: gere um aviso no componente.

**Outputs.** `@Output()` (com ou sem alias), `output()` e o `xChange` de cada `model()`.

**Tipo do input → `TipoCampo`:**

| Tipo TypeScript | `TipoCampo` |
|---|---|
| `string` | `texto` |
| `number` | `numero` |
| `boolean` | `booleano` |
| `Date` | `data` |
| União de literais de texto ou número; `enum` | `opcoes` |
| Lista (`T[]`, `Array<T>`, `ReadonlyArray<T>`) | `lista` |
| Interface, tipo literal ou classe só com propriedades de dado | `objeto` |
| `T \| null` e `T \| undefined` | o tipo de `T`, marcando `aceitaNulo` ou `opcional` |
| Função, `TemplateRef`, `Observable`, signal, `any`, `unknown`, parâmetro genérico, união de tipos diferentes | `naoEditavel` |
| Aninhamento além de 5 níveis, ou tipo que se refere a si mesmo | `naoEditavel` |

Resolva os tipos com o verificador de tipos (apelidos e interfaces importadas são seguidos
até a definição). Todo `naoEditavel` gera um aviso no componente.

**Valor padrão.** Só quando o valor inicial é um literal (texto, número, booleano, nulo,
lista ou objeto de literais). Qualquer outra expressão: sem `padrao`.

**Filhos.** Leia o template (em linha ou em arquivo) com o analisador de templates do
`@angular/compiler` e percorra todos os nós, inclusive dentro de blocos de controle e
`@defer`. Um elemento é filho quando seu nome bate com a parte de elemento do seletor de um
componente do projeto; para seletores de atributo, quando o atributo está presente.
Componentes criados só por código (diálogos dinâmicos, `ngComponentOutlet`) não são
detectados; isso é uma limitação aceita.

**Arquivo de ajuste.** Se existir `<mesmo-nome>.proto.ts` ao lado do `.component.ts`, o
campo `ajuste` aponta para ele.

A API do analisador de templates muda entre versões do Angular. Concentre todo o uso dela
num único módulo do gerador e confira a API da versão instalada antes de escrever.

## Leitura dos mocks

- Importe cada arquivo do padrão `mocks` e aplique as regras de `03-dados.md`.
- Para nomear a entidade pela anotação de tipo do export, leia a declaração com `ts-morph`.
- Mock que falha ao importar (ex.: porque importa algo do Angular) vira aviso.

## Leitura das tags

**No template**, registre um uso para cada ocorrência de:

| Forma | Chave |
|---|---|
| `'chave' \| translate` (com ou sem parâmetros) | fixa |
| `<el translate>chave</el>` | fixa |
| `[translate]="'chave'"` | fixa |
| Qualquer uma das anteriores com expressão que não é texto fixo | dinâmica |

O nome do pipe e da diretiva vem de `traducao.pipe` na configuração.

**No `.ts`**, registre um uso para cada chamada a `instant`, `get` ou `stream` num objeto do
tipo `traducao.servico`: texto fixo (ou lista de textos fixos) → chaves fixas; outra
expressão → dinâmica. Registre também os usos prováveis descritos em `04-traducoes.md`.

Papel, condição e trecho seguem as tabelas de `04-traducoes.md`. A linha é a do arquivo em
que a chave aparece (o `.html`, quando o template é externo).

**Textos.** Leia os três arquivos i18n, achate chaves aninhadas em caminhos com ponto e
preencha `textos` de cada tag usada.

**Planilha.** Leia o CSV detectando o separador (`,` ou `;`) e ignorando a marca de ordem
de bytes. A primeira linha é o cabeçalho; a coluna é a de nome `planilha.colunaChave`.
Compare as chaves sem espaços nas pontas. Se o arquivo não existir ou a coluna não for
encontrada, `planilhaDisponivel` é `false`, todo `naPlanilha` é `null` e um aviso lista os
cabeçalhos encontrados.

## Testes

O gerador é a parte em que um erro silencioso mais custa, então tem testes. Use o executor
de testes do próprio Node (`node:test`), sem dependência nova.

Crie em `gerador/testes/exemplos/` um mini-projeto de exemplo (alguns componentes, um
mock, três arquivos i18n e um CSV) e cubra pelo menos:

1. Cada forma de input e de output da tabela, com alias e obrigatoriedade.
2. Cada linha da tabela de tipos, incluindo um tipo que se refere a si mesmo.
3. Filhos em template em linha, em arquivo e dentro de bloco de controle.
4. Cada regra de atributo e de relacionamento de `03-dados.md`, com as duas confianças.
5. Cada forma de uso de tag, um papel de cada tabela, uma condição e uma chave dinâmica.
6. CSV com `,` e com `;`, e coluna não encontrada.
7. Um arquivo com erro de sintaxe: a geração termina e o aviso aparece.
