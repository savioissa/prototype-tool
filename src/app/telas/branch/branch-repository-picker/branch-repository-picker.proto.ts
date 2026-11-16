// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar, falhar, responder, semResposta, simularServico } from '../../../prototipador/teste/ajustar';
import { emptyRepositoryFilter } from '../branch.model';
import { BranchService } from '../branch.service';
import { BranchRepositoryPickerComponent } from './branch-repository-picker.component';

export default ajustar(BranchRepositoryPickerComponent, {
  estados: {
    'Área clicável': { descricao: 'Sem escolha: a área "Selecionar repositório" abre a vinculação no lugar dela.' },
    'Repositórios do tipo': {
      descricao: 'Vinculação aberta: começa pelo tipo Equipe.',
      acao: (escolha) => escolha.abrirVinculacao(),
    },
    'Com seleção': {
      descricao: 'O usuário já escolheu um repositório.',
      inputs: { selected: { tipo: 'equipe', codigo: 'jsilva', nome: 'João Silva' } },
    },
    'Carregando': {
      provedores: [simularServico(BranchService, { listarRepositoriosPorTipo: () => semResposta() })],
      acao: (escolha) => escolha.abrirVinculacao(),
    },
    'Nenhum repositório deste tipo': {
      provedores: [simularServico(BranchService, { listarRepositoriosPorTipo: () => responder([]) })],
      acao: (escolha) => escolha.abrirVinculacao(),
    },
    'Nenhum resultado encontrado': {
      descricao: 'O usuário filtrou por um login que não existe (zzz).',
      acao: (escolha) => {
        const filtro = emptyRepositoryFilter();
        filtro.campos.equipe.codigo = { operador: 'igual', valor: 'zzz' };
        escolha.abrirVinculacao();
        escolha.showFilter = true;
        escolha.filtro = filtro;
        escolha.carregar();
      },
    },
    'Erro ao carregar': {
      provedores: [simularServico(BranchService, { listarRepositoriosPorTipo: () => falhar() })],
      acao: (escolha) => escolha.abrirVinculacao(),
    },
  },
});
