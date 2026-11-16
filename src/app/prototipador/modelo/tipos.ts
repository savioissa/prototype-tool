// Contrato entre o gerador (Node) e a interface (Angular).
// TypeScript puro: sem imports do Angular nem do Node.

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
  /** Lista de valores simples (ex.: `tipos: RepositoryType[]`). */
  lista?: boolean;
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
  // agrupamento: dados guardados por chave de outra entidade (ex.: almoxarifados por código da filial)
  regra: 'aninhado' | 'listaAninhada' | 'referencia' | 'listaDeReferencias' | 'agrupamento';
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
