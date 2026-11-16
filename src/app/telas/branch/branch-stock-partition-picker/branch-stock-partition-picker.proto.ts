// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar, falhar, responder, semResposta, simularServico } from '../../../prototipador/teste/ajustar';
import { BranchService } from '../branch.service';
import { BranchStockPartitionPickerComponent } from './branch-stock-partition-picker.component';

export default ajustar(BranchStockPartitionPickerComponent, {
  estados: {
    'Catálogo': { descricao: 'Vinculação aberta (padrão ao adicionar repositório): todos os almoxarifados do sistema.' },
    'Área clicável': {
      descricao: 'Vinculação fechada sem escolha: a área "Selecionar almoxarifado" volta a abri-la.',
      acao: (escolha) => escolha.fechar(),
    },
    'Com seleção': {
      descricao: 'O usuário já escolheu um almoxarifado.',
      inputs: { selected: { codigo: 'Venda', descricao: 'Partição de venda' } },
    },
    'Carregando': { provedores: [simularServico(BranchService, { listarCatalogoAlmoxarifados: () => semResposta() })] },
    'Nenhum almoxarifado cadastrado': {
      provedores: [simularServico(BranchService, { listarCatalogoAlmoxarifados: () => responder([]) })],
    },
    'Nenhum resultado encontrado': {
      descricao: 'O usuário filtrou por um código que não existe (XYZ).',
      acao: (escolha) => {
        escolha.showFilter = true;
        escolha.filtro = { codigo: { operador: 'igual', valor: 'XYZ' }, descricao: { operador: null, valor: '' } };
        escolha.carregar();
      },
    },
    'Erro ao carregar': { provedores: [simularServico(BranchService, { listarCatalogoAlmoxarifados: () => falhar() })] },
  },
});
