// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar } from '../../../prototipador/teste/ajustar';
import { BranchRepositoryAddComponent } from './branch-repository-add.component';

export default ajustar(BranchRepositoryAddComponent, {
  estados: {
    'Adicionar à filial MTZ': {
      descricao: 'Painel "Adicionar repositório": escolha do repositório e do almoxarifado.',
      inputs: { branchCode: 'MTZ' },
    },
    'Com par já vinculado': {
      descricao: 'O par jsilva + Central já existe na filial e não pode ser adicionado de novo.',
      inputs: {
        branchCode: 'MTZ',
        linked: [
          {
            tipo: 'equipe',
            codigo: 'jsilva',
            nome: 'João Silva',
            almoxarifado: { codigo: 'Central', descricao: 'Almoxarifado central' },
            insumos: 12,
          },
        ],
      },
    },
  },
});
