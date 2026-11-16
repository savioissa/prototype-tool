// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar, falhar, simularServico } from '../../../prototipador/teste/ajustar';
import { BranchService } from '../branch.service';
import { BranchRegisterComponent } from './branch-register.component';

const MATRIZ = { codigo: 'MTZ', descricao: 'Matriz' };

export default ajustar(BranchRegisterComponent, {
  estados: {
    'Visualização': { inputs: { branch: MATRIZ } },
    'Editando': {
      descricao: 'O usuário clicou em Editar.',
      inputs: { branch: MATRIZ },
      acao: (cadastro) => cadastro.editar(),
    },
    'Código já existe': {
      descricao: 'O usuário trocou o código para um que já existe (SPO) e salvou.',
      inputs: { branch: MATRIZ },
      acao: (cadastro) => {
        cadastro.editar();
        cadastro.form.setValue({ codigo: 'SPO', descricao: 'Matriz' });
        cadastro.salvar();
      },
    },
    'Erro ao salvar': {
      descricao: 'O serviço responde com erro ao salvar.',
      inputs: { branch: MATRIZ },
      provedores: [simularServico(BranchService, { atualizar: () => falhar() })],
      acao: (cadastro) => {
        cadastro.editar();
        cadastro.form.setValue({ codigo: 'MTZ', descricao: 'Matriz atualizada' });
        cadastro.salvar();
      },
    },
    'Carregando': { inputs: { branch: null, loading: true } },
  },
});
