// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar } from '../../../prototipador/teste/ajustar';
import { BranchSidebarComponent } from './branch-sidebar.component';

export default ajustar(BranchSidebarComponent, {
  largura: 320,
  estados: {
    'Filial': { inputs: { branch: { codigo: 'MTZ', descricao: 'Matriz' } } },
    'Descrição longa': {
      inputs: { branch: { codigo: 'SPO', descricao: 'Centro de distribuição São Paulo — Zona Leste, galpão 3, doca 12' } },
    },
    'Carregando': { inputs: { loading: true } },
  },
});
