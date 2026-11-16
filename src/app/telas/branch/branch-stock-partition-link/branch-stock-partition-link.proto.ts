// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar, falhar, responder, semResposta, simularServico } from '../../../prototipador/teste/ajustar';
import { BranchService } from '../branch.service';
import { BranchStockPartitionLinkComponent } from './branch-stock-partition-link.component';

export default ajustar(BranchStockPartitionLinkComponent, {
  estados: {
    'Almoxarifados disponíveis': {
      descricao: 'Vincular almoxarifados à filial PRO: lista os que ainda não estão vinculados.',
      inputs: { branchCode: 'PRO' },
    },
    'Carregando': {
      inputs: { branchCode: 'PRO' },
      provedores: [simularServico(BranchService, { listarAlmoxarifadosDisponiveis: () => semResposta() })],
    },
    'Todos já vinculados': {
      descricao: 'Não sobrou almoxarifado para vincular.',
      inputs: { branchCode: 'PRO' },
      provedores: [simularServico(BranchService, { listarAlmoxarifadosDisponiveis: () => responder([]) })],
    },
    'Nenhum resultado encontrado': {
      descricao: 'O usuário filtrou por um código que não existe (XYZ).',
      inputs: { branchCode: 'PRO' },
      acao: (painel) => {
        painel.showFilter = true;
        painel.filtro = { codigo: { operador: 'igual', valor: 'XYZ' }, descricao: { operador: null, valor: '' } };
        painel.carregar();
      },
    },
    'Erro ao carregar': {
      inputs: { branchCode: 'PRO' },
      provedores: [simularServico(BranchService, { listarAlmoxarifadosDisponiveis: () => falhar() })],
    },
  },
});
