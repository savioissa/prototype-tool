// Tipos de dados do mini-projeto de exemplo (teste de dados do gerador).
export interface Loja {
  id: number;
  nome: string;
}

export interface Endereco {
  rua: string;
  cidade: string;
}

export interface Tag {
  id: number;
  rotulo: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  lojaId: number;
  tagIds: number[];
  categoria: { nome: string; ativa: boolean };
}

export interface Cliente {
  codigo: string;
  nome: string;
  email?: string;
  vip?: boolean;
  desde: string;
  endereco: Endereco;
  enderecos?: Endereco[];
}

export interface Pedido {
  id: number;
  clienteCodigo: string;
  lojaId: number;
}

export interface Visita {
  dia: string;
}

/** Só aparece como retorno de serviço: entidade sem registros. */
export interface Resumo {
  total: number;
  atualizado: boolean;
}

/** Tipo de filtro da tela: não é devolvido por serviço nem tem dados, não vira entidade. */
export interface FiltroDaTela {
  texto: string;
}
