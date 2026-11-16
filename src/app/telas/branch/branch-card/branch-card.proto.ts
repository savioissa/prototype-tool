// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar } from '../../../prototipador/teste/ajustar';
import { BRANCH_FIELD_MAX_LENGTH } from '../branch-fields/branch-fields.component';
import { BranchCardComponent } from './branch-card.component';

export default ajustar(BranchCardComponent, {
  largura: 520,
  estados: {
    'Filial': { inputs: { branch: { codigo: 'MTZ', descricao: 'Matriz' } } },
    'Descrição longa': {
      descricao: 'Descrição maior que a coluna: o texto é cortado com reticências.',
      inputs: { branch: { codigo: 'SPO', descricao: 'Centro de distribuição São Paulo — Zona Leste, galpão 3, doca 12' } },
    },
    'Carregando': {
      descricao: 'Enquanto a lista carrega, o card vira um bloco de skeleton da mesma altura.',
      inputs: { loading: true },
    },
  },
  limites: {
    'branch.codigo': { min: 1, max: BRANCH_FIELD_MAX_LENGTH },
    'branch.descricao': { min: 1, max: BRANCH_FIELD_MAX_LENGTH },
  },
});
