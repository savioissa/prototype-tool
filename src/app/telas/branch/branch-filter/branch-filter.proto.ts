// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar } from '../../../prototipador/teste/ajustar';
import { emptyFilter } from '../branch.model';
import { BranchFilterComponent } from './branch-filter.component';

export default ajustar(BranchFilterComponent, {
  estados: {
    'Vazio': { inputs: () => ({ filter: emptyFilter() }) },
    'Preenchido': {
      inputs: () => ({
        filter: { codigo: { operador: 'comeca', valor: 'M' }, descricao: { operador: 'contem', valor: 'Matriz' } },
      }),
    },
  },
});
