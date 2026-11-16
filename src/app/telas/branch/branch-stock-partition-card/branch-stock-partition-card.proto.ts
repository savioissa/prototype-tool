// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar } from '../../../prototipador/teste/ajustar';
import { BranchStockPartitionCardComponent } from './branch-stock-partition-card.component';

const VENDA = { codigo: 'Venda', descricao: 'Partição de venda' };

export default ajustar(BranchStockPartitionCardComponent, {
  largura: 640,
  estados: {
    'Almoxarifado': { inputs: { stockPartition: VENDA } },
    'Vinculado à filial': {
      descricao: 'Na aba Almoxarifado: com a ação de desvincular.',
      inputs: { stockPartition: VENDA, unlinkable: true },
    },
    'Selecionável': {
      descricao: 'Ao vincular almoxarifados: caixa de seleção desmarcada.',
      inputs: { stockPartition: VENDA, selectable: true },
    },
    'Selecionado': { inputs: { stockPartition: VENDA, selectable: true, selected: true } },
    'Na escolha de almoxarifado': {
      descricao: 'Ao adicionar repositório: a ação de selecionar aparece antes de abrir.',
      inputs: { stockPartition: VENDA, pickable: true },
    },
    'Carregando': { inputs: { loading: true } },
  },
});
