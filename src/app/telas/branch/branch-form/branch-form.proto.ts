// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { ajustar, falhar, semResposta, simularServico } from '../../../prototipador/teste/ajustar';
import { BranchService } from '../branch.service';
import { BranchFormComponent } from './branch-form.component';

export default ajustar(BranchFormComponent, {
  estados: {
    'Em branco': { descricao: 'Cadastro de nova filial, como o usuário encontra ao clicar em "Novo".' },
    'Campos obrigatórios': {
      descricao: 'O usuário clicou em Salvar sem preencher.',
      acao: (pagina) => pagina.salvar(),
    },
    'Código já existe': {
      descricao: 'O usuário salvou com um código que já existe (MTZ): o serviço recusa e o erro aparece no campo.',
      acao: (pagina) => {
        pagina.form.setValue({ codigo: 'MTZ', descricao: 'Matriz nova' });
        pagina.salvar();
      },
    },
    'Salvando': {
      descricao: 'Depois de clicar em Salvar, enquanto o serviço não responde.',
      provedores: [simularServico(BranchService, { criar: () => semResposta() })],
      acao: (pagina) => {
        pagina.form.setValue({ codigo: 'NOV', descricao: 'Filial nova' });
        pagina.salvar();
      },
    },
    'Erro ao salvar': {
      descricao: 'O serviço responde com erro: aviso "Não foi possível criar a filial".',
      provedores: [simularServico(BranchService, { criar: () => falhar() })],
      acao: (pagina) => {
        pagina.form.setValue({ codigo: 'NOV', descricao: 'Filial nova' });
        pagina.salvar();
      },
    },
  },
});
