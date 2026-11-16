// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar, falhar, responder, semResposta, simularServico } from '../../../prototipador/teste/ajustar';
import { emptyRepositoryFilter } from '../branch.model';
import { BranchService } from '../branch.service';
import { BranchRepositoriesComponent } from './branch-repositories.component';

export default ajustar(BranchRepositoriesComponent, {
  estados: {
    'Com repositórios': {
      descricao: 'Aba Repositório da filial MTZ: pares almoxarifado + repositório vinculados.',
      inputs: { branchCode: 'MTZ' },
    },
    'Carregando': {
      inputs: { branchCode: 'MTZ' },
      provedores: [simularServico(BranchService, { listarRepositorios: () => semResposta() })],
    },
    'Nenhum repositório vinculado': {
      descricao: 'O serviço responde com a lista vazia.',
      inputs: { branchCode: 'MTZ' },
      provedores: [simularServico(BranchService, { listarRepositorios: () => responder([]) })],
    },
    'Nenhum resultado encontrado': {
      descricao: 'O usuário filtrou por um login de equipe que não está vinculado (zzz).',
      inputs: { branchCode: 'MTZ' },
      acao: (aba) => {
        const filtro = emptyRepositoryFilter();
        filtro.campos.equipe.codigo = { operador: 'igual', valor: 'zzz' };
        aba.showFilter = true;
        aba.filtro = filtro;
        aba.carregar();
      },
    },
    'Erro ao carregar': {
      inputs: { branchCode: 'MTZ' },
      provedores: [simularServico(BranchService, { listarRepositorios: () => falhar() })],
    },
  },
});
