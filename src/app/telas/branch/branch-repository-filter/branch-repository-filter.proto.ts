// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar } from '../../../prototipador/teste/ajustar';
import { emptyRepositoryFilter } from '../branch.model';
import { BranchRepositoryFilterComponent } from './branch-repository-filter.component';

export default ajustar(BranchRepositoryFilterComponent, {
  estados: {
    'Todos os tipos': {
      descricao: 'Aba Repositório: Tipo repositório e os campos de cada tipo.',
      inputs: () => ({ filter: emptyRepositoryFilter() }),
    },
    'Tipos escolhidos': {
      descricao: 'O usuário marcou Equipe e Oficina: os campos dos outros tipos ficam desabilitados.',
      inputs: () => ({ filter: { ...emptyRepositoryFilter(), tipos: ['equipe', 'oficina'] } }),
    },
    'Tipo fixo (Equipe)': {
      descricao: 'Na escolha de repositório o tipo já vem definido: só os campos dele.',
      inputs: () => ({ filter: emptyRepositoryFilter(), tipo: 'equipe' }),
    },
  },
});
