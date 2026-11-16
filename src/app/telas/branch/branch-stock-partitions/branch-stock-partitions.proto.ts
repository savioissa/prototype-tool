// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar, falhar, responder, semResposta, simularServico } from '../../../prototipador/teste/ajustar';
import { BranchService } from '../branch.service';
import { BranchStockPartitionsComponent } from './branch-stock-partitions.component';

export default ajustar(BranchStockPartitionsComponent, {
  estados: {
    'Com almoxarifados': {
      descricao: 'Aba Almoxarifado da filial MTZ: almoxarifados vinculados.',
      inputs: { branchCode: 'MTZ' },
    },
    'Carregando': {
      inputs: { branchCode: 'MTZ' },
      provedores: [simularServico(BranchService, { listarAlmoxarifados: () => semResposta() })],
    },
    'Nenhum almoxarifado vinculado': {
      descricao: 'O serviço responde com a lista vazia.',
      inputs: { branchCode: 'MTZ' },
      provedores: [simularServico(BranchService, { listarAlmoxarifados: () => responder([]) })],
    },
    'Nenhum resultado encontrado': {
      descricao: 'O usuário filtrou por um código que não está vinculado (XYZ).',
      inputs: { branchCode: 'MTZ' },
      acao: (aba) => {
        aba.showFilter = true;
        aba.filtro = { codigo: { operador: 'igual', valor: 'XYZ' }, descricao: { operador: null, valor: '' } };
        aba.carregar();
      },
    },
    'Erro ao carregar': {
      inputs: { branchCode: 'MTZ' },
      provedores: [simularServico(BranchService, { listarAlmoxarifados: () => falhar() })],
    },
  },
});
