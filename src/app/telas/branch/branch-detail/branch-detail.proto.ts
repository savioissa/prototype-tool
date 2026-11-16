// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
// Filial não encontrada e erro ao carregar não são estados da página: viram toast na lista (ver branch-list).
import { ajustar, semResposta, simularRota, simularServico } from '../../../prototipador/teste/ajustar';
import { BranchService } from '../branch.service';
import { BranchDetailComponent } from './branch-detail.component';

export default ajustar(BranchDetailComponent, {
  estados: {
    'Carregando': {
      descricao: 'Enquanto o serviço não responde: resumo e cadastro em skeleton.',
      provedores: [simularRota({ codigo: 'MTZ' }), simularServico(BranchService, { obter: () => semResposta() })],
    },
    'Filial carregada': {
      descricao: 'Abre a filial pela URL /filial/MTZ, na aba Cadastro.',
      provedores: [simularRota({ codigo: 'MTZ' })],
    },
  },
});
