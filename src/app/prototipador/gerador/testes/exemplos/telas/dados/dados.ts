// Constantes de dados do mini-projeto de exemplo (teste de dados do gerador).
import { Cliente, Loja, Pedido, Produto, Tag, Visita } from './modelo';

export const LOJAS: Loja[] = [
  { id: 1, nome: 'Centro' },
  { id: 2, nome: 'Norte' },
];

export const TAGS: Tag[] = [{ id: 100, rotulo: 'novo' }];

export const PRODUTOS: Produto[] = [
  { id: 10, nome: 'Caneta', preco: 1.5, lojaId: 1, tagIds: [100], categoria: { nome: 'Escritório', ativa: true } },
  { id: 11, nome: 'Lápis', preco: 0.8, lojaId: 2, tagIds: [], categoria: { nome: 'Escritório', ativa: false } },
];

export const CLIENTES: Cliente[] = [
  { codigo: 'C1', nome: 'Ana', email: 'ana@exemplo.com', vip: true, desde: '2024-01-05', endereco: { rua: 'A', cidade: 'X' } },
  { codigo: 'C2', nome: 'Bruno', desde: '2023-11-20', endereco: { rua: 'B', cidade: 'Y' }, enderecos: [{ rua: 'C', cidade: 'Z' }] },
];

// lojaId 9 não existe em LOJAS: referência provável (baixa). clienteCodigo existe em CLIENTES: confirmada pelos valores.
export const PEDIDOS: Pedido[] = [{ id: 1, clienteCodigo: 'C1', lojaId: 9 }];

// Agrupado pela chave de outra entidade (código do cliente).
export const VISITAS_POR_CLIENTE: Record<string, Visita[]> = {
  C1: [{ dia: '2024-02-01' }],
  C2: [{ dia: '2024-03-10' }, { dia: '2024-03-11' }],
};

// Sem tipo com nome: opções de tela, não é entidade.
export const OPCOES: { rotulo: string; valor: number }[] = [{ rotulo: 'Um', valor: 1 }];

// Não é feito só de valores fixos: vira aviso.
export const LOJAS_CALCULADAS: Loja[] = LOJAS.map((loja) => ({ ...loja }));
