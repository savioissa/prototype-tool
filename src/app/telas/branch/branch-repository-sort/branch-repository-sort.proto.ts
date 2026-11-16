// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar } from '../../../prototipador/teste/ajustar';
import { BranchRepositorySortComponent } from './branch-repository-sort.component';

export default ajustar(BranchRepositorySortComponent, {
  largura: 420,
  estados: {
    'Sem ordenação': { inputs: () => ({ sort: { campo: null, direcao: 'asc' } }) },
    'Tipo, A → Z (padrão da aba)': { inputs: () => ({ sort: { campo: 'tipo', direcao: 'asc' } }) },
    'Descrição do armazém, Z → A': { inputs: () => ({ sort: { campo: 'armazem.nome', direcao: 'desc' } }) },
  },
});
