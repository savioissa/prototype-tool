export interface Branch {
  codigo: string;
  descricao: string;
}

/** Almoxarifado vinculado a uma filial. */
export interface Warehouse {
  codigo: string;
  descricao: string;
}

/** Filtro e ordenação servem para qualquer registro com código + descrição (filial, almoxarifado). */
export interface CodeDescription {
  codigo: string;
  descricao: string;
}

export type FilterOperator = 'igual' | 'diferente' | 'contem' | 'comeca' | 'termina';

export interface FilterField {
  operador: FilterOperator | null;
  valor: string;
}

export interface BranchFilter {
  codigo: FilterField;
  descricao: FilterField;
}

export type SortField = keyof CodeDescription;
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  campo: SortField | null;
  direcao: SortDirection;
}

export function emptyFilter(): BranchFilter {
  return {
    codigo: { operador: 'igual', valor: '' },
    descricao: { operador: null, valor: '' }
  };
}

export function emptySort(): SortState {
  return { campo: null, direcao: 'asc' };
}

/* ---------- Repositório ---------- */

export type RepositoryType = 'equipe' | 'credenciada' | 'armazem' | 'oficina' | 'cluster';

/** `label` é o nome em português (ordena a coluna Tipo); `tag` é a tag de tradução. */
export const REPOSITORY_TYPES: { label: string; tag: string; value: RepositoryType }[] = [
  { label: 'Equipe', tag: 'portal.generic.label.team', value: 'equipe' },
  { label: 'Credenciada', tag: 'third.party', value: 'credenciada' },
  { label: 'Armazém', tag: 'iclass.generic.label.warehouse', value: 'armazem' },
  { label: 'Oficina', tag: 'portal.generic.label.workshop', value: 'oficina' },
  { label: 'Cluster', tag: 'iclass.generic.label.cluster', value: 'cluster' }
];

/**
 * Repositório do catálogo. Para o tipo Equipe, `codigo` é o login e `nome` é o técnico; para Armazém e Oficina,
 * `nome` é a descrição. Oficina tem também a credenciada à qual pertence e Cluster, a regional.
 */
export interface Repository {
  tipo: RepositoryType;
  codigo: string;
  nome: string;
  /** Só Oficina: nome da credenciada à qual a oficina pertence. */
  credenciada?: string;
  /** Só Cluster: regional à qual o cluster pertence. */
  regional?: string;
}

/** Campo de repositório que o card mostra e o filtro compara. */
export type RepositoryField = 'codigo' | 'nome' | 'credenciada' | 'regional';

/** Um dos dois campos de um tipo: tag do rótulo no card e tag do rótulo no filtro. */
export interface RepositoryFieldDef {
  campo: RepositoryField;
  rotulo: string;
  filtro: string;
}

/**
 * Os dois campos de cada tipo, na ordem do card e do filtro:
 * Equipe Login/Técnico, Credenciada Código/Nome, Armazém Código/Descrição, Oficina Descrição/Credenciada,
 * Cluster Regional/Nome.
 */
export const REPOSITORY_FIELDS: Record<RepositoryType, [RepositoryFieldDef, RepositoryFieldDef]> = {
  equipe: [
    { campo: 'codigo', rotulo: 'iclass.generic.label.login', filtro: 'iclass.generic.label.team-login' },
    { campo: 'nome', rotulo: 'iclass.generic.label.technician', filtro: 'iclass.generic.label.team-name' }
  ],
  credenciada: [
    { campo: 'codigo', rotulo: 'iclass.generic.label.code', filtro: 'iclass.generic.label.third-party-code' },
    { campo: 'nome', rotulo: 'portal.generic.label.name', filtro: 'iclass.generic.label.third-party-description' }
  ],
  armazem: [
    { campo: 'codigo', rotulo: 'iclass.generic.label.code', filtro: 'iclass.generic.label.warehouse-code' },
    { campo: 'nome', rotulo: 'iclass.generic.label.description', filtro: 'iclass.generic.label.warehouse-description' }
  ],
  oficina: [
    { campo: 'nome', rotulo: 'iclass.generic.label.description', filtro: 'iclass.generic.label.workshop-description' },
    { campo: 'credenciada', rotulo: 'third.party', filtro: 'iclass.generic.label.workshop-third-party' }
  ],
  cluster: [
    { campo: 'regional', rotulo: 'iclass.generic.label.regional', filtro: 'iclass.generic.label.cluster-regional' },
    { campo: 'nome', rotulo: 'portal.generic.label.name', filtro: 'iclass.generic.label.cluster-name' }
  ]
};

/**
 * Vínculo da filial: um par almoxarifado + repositório (Filial x Repositório x Almoxarifado).
 * O mesmo repositório pode aparecer em vários pares, um por almoxarifado.
 */
export interface LinkedRepository extends Repository {
  almoxarifado: Warehouse;
  /** Quantidade de insumos do repositório neste almoxarifado. */
  insumos: number;
}

/** Vínculo a gravar: repositório + código do almoxarifado. */
export interface RepositoryLink {
  tipo: RepositoryType;
  codigo: string;
  almoxarifado: string;
  /** Insumos do par (só no mock: na API vem do estoque). */
  insumos?: number;
}

/** Par repositório x almoxarifado que ainda tem insumos: impede desvincular até movimentar tudo. */
export interface SupplyHolder {
  repositorio: Repository;
  almoxarifado: Warehouse;
  quantidade: number;
}

/** Campos de filtro de um tipo de repositório; cada tipo usa os dois de REPOSITORY_FIELDS, os outros ficam vazios. */
export type RepositoryTypeFilter = Record<RepositoryField, FilterField>;

/**
 * Filtro de repositórios: Tipo repositório + os dois campos de cada tipo
 * (ex.: Código/Descrição do armazém, Login/Nome da equipe, Descrição/Credenciada da oficina, Regional/Nome do cluster).
 */
export interface RepositoryFilter {
  tipos: RepositoryType[];
  campos: Record<RepositoryType, RepositoryTypeFilter>;
}

/** Ordem dos tipos no painel de filtro; os campos de cada um vêm de REPOSITORY_FIELDS. */
export const REPOSITORY_FILTER_ORDER: RepositoryType[] = ['armazem', 'credenciada', 'equipe', 'oficina', 'cluster'];

/** Campo de ordenação de repositórios: o tipo ou um campo de um tipo (ex.: "armazem.nome"), as mesmas opções do filtro. */
export type RepositorySortField = 'tipo' | `${RepositoryType}.${RepositoryField}`;

export interface RepositorySortState {
  campo: RepositorySortField | null;
  direcao: SortDirection;
}

/** Opções da ordenação de repositórios, com as mesmas tags do filtro: Tipo repositório e os dois campos de cada tipo. */
export const REPOSITORY_SORT_OPTIONS: { label: string; value: RepositorySortField }[] = [
  { label: 'iclass.generic.label.repository-type', value: 'tipo' },
  ...REPOSITORY_FILTER_ORDER.flatMap((tipo) =>
    REPOSITORY_FIELDS[tipo].map((f) => ({ label: f.filtro, value: `${tipo}.${f.campo}` as RepositorySortField }))
  )
];

/** O código pode se repetir entre tipos (ex.: um login igual ao código de uma credenciada). */
export function repositoryKey(r: Pick<Repository, 'tipo' | 'codigo'>): string {
  return `${r.tipo}:${r.codigo}`;
}

/** Chave do par almoxarifado + repositório. */
export function repositoryLinkKey(r: Pick<Repository, 'tipo' | 'codigo'>, almoxarifado: string): string {
  return `${repositoryKey(r)}|${almoxarifado}`;
}

export function repositoryTypeLabel(tipo: RepositoryType): string {
  return REPOSITORY_TYPES.find((t) => t.value === tipo)?.label ?? tipo;
}

export function repositoryTypeTag(tipo: RepositoryType): string {
  return REPOSITORY_TYPES.find((t) => t.value === tipo)?.tag ?? tipo;
}

export function emptyRepositoryFilter(): RepositoryFilter {
  const par = (): RepositoryTypeFilter => ({
    codigo: { operador: 'igual', valor: '' },
    nome: { operador: null, valor: '' },
    credenciada: { operador: null, valor: '' },
    regional: { operador: null, valor: '' }
  });
  return {
    tipos: [],
    campos: { armazem: par(), credenciada: par(), equipe: par(), oficina: par(), cluster: par() }
  };
}
