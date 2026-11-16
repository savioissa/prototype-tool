// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar } from '../../../prototipador/teste/ajustar';
import { emptySort } from '../branch.model';
import { BranchSortComponent } from './branch-sort.component';

export default ajustar(BranchSortComponent, {
  largura: 420,
  estados: {
    'Sem ordenação': { inputs: () => ({ sort: emptySort() }) },
    'Descrição, Z → A': { inputs: () => ({ sort: { campo: 'descricao', direcao: 'desc' } }) },
  },
});
