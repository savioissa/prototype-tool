// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar, falhar, responder, semResposta, simularServico } from '../../../prototipador/teste/ajustar';
import { BranchService } from '../branch.service';
import { BranchListComponent } from './branch-list.component';

export default ajustar(BranchListComponent, {
  estados: {
    'Com filiais': {
      descricao: 'O serviço responde com as filiais cadastradas: lista paginada, 7 por página.',
    },
    'Carregando': {
      descricao: 'Enquanto o serviço não responde, a lista mostra blocos de skeleton e o "Atualizar" fica desabilitado.',
      provedores: [simularServico(BranchService, { listar: () => semResposta() })],
    },
    'Nenhuma filial cadastrada': {
      descricao: 'O serviço responde com a lista vazia.',
      provedores: [simularServico(BranchService, { listar: () => responder([]) })],
    },
    'Nenhum resultado encontrado': {
      descricao: 'Há filiais, mas o filtro que o usuário aplicou (código igual a XYZ) não encontra nenhuma.',
      acao: (lista) => {
        lista.showFilter = true;
        lista.filtro = { codigo: { operador: 'igual', valor: 'XYZ' }, descricao: { operador: null, valor: '' } };
        lista.carregar();
      },
    },
    'Erro ao carregar': {
      descricao: 'O serviço responde com erro: mensagem e botão "Tentar novamente".',
      provedores: [simularServico(BranchService, { listar: () => falhar() })],
    },
    'Abrir: filial não encontrada': {
      descricao: 'O usuário clica no handle de uma filial que não existe mais: toast de erro e continua na lista.',
      provedores: [simularServico(BranchService, { obter: () => responder(null) })],
      acao: (lista) => lista.abrir({ codigo: 'MTZ', descricao: 'Matriz' }),
    },
    'Abrir: erro ao carregar': {
      descricao: 'O usuário clica no handle e o serviço responde com erro: toast de erro e continua na lista.',
      provedores: [simularServico(BranchService, { obter: () => falhar() })],
      acao: (lista) => lista.abrir({ codigo: 'MTZ', descricao: 'Matriz' }),
    },
  },
});
