// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar } from '../../../prototipador/teste/ajustar';
import { BranchRepositoryCardComponent } from './branch-repository-card.component';

const CENTRAL = { codigo: 'Central', descricao: 'Almoxarifado central' };

export default ajustar(BranchRepositoryCardComponent, {
  largura: 760,
  estados: {
    'Equipe': {
      descricao: 'Para Equipe, o código é o login e o nome é o do técnico.',
      inputs: { repository: { tipo: 'equipe', codigo: 'jsilva', nome: 'João Silva' } },
    },
    'Credenciada': { inputs: { repository: { tipo: 'credenciada', codigo: 'CR001', nome: 'Refrigeração Polar Ltda' } } },
    'Armazém': {
      descricao: 'Armazém mostra Código e Descrição.',
      inputs: { repository: { tipo: 'armazem', codigo: 'ARM02', nome: 'Armazém Zona Norte' } },
    },
    'Oficina': {
      descricao: 'Oficina mostra Descrição e a Credenciada à qual pertence (sem código).',
      inputs: { repository: { tipo: 'oficina', codigo: 'OF001', nome: 'Oficina Mecânica Centro', credenciada: 'TecnoClima Manutenção' } },
    },
    'Cluster': {
      descricao: 'Cluster mostra a Regional à qual pertence e o Nome (sem código).',
      inputs: { repository: { tipo: 'cluster', codigo: 'CL001', nome: 'Cluster Sudeste', regional: 'Regional São Paulo' } },
    },
    'Vinculado à filial': {
      descricao: 'Na aba Repositório: mostra o almoxarifado do par e a ação de desvincular.',
      inputs: { repository: { tipo: 'equipe', codigo: 'jsilva', nome: 'João Silva' }, stockPartition: CENTRAL, unlinkable: true },
    },
    'Na escolha de repositório': {
      descricao: 'Ao adicionar repositório: a ação de selecionar aparece antes de abrir.',
      inputs: { repository: { tipo: 'credenciada', codigo: 'CR001', nome: 'Refrigeração Polar Ltda' }, pickable: true },
    },
    'Carregando': { inputs: { loading: true } },
  },
});
