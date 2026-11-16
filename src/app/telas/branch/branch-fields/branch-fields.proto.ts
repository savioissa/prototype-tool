// Estados para a área de teste do prototipador. Não muda o componente; é apagado junto com o
// prototipador. Ver docs/prototipador/02-area-de-teste.md, seção "Arquivo de ajuste".
import { FormBuilder } from '@angular/forms';

import { ajustar } from '../../../prototipador/teste/ajustar';
import { BRANCH_FIELD_MAX_LENGTH, BranchFieldsComponent, createBranchForm } from './branch-fields.component';

/** Formulário novo a cada vez que o estado é aplicado, para "Restaurar" voltar ao início. */
function formulario(codigo = '', descricao = '') {
  const form = createBranchForm(new FormBuilder().nonNullable);
  form.setValue({ codigo, descricao });
  return form;
}

export default ajustar(BranchFieldsComponent, {
  largura: 640,
  estados: {
    'Em branco': { inputs: () => ({ group: formulario() }) },
    'Preenchido': { inputs: () => ({ group: formulario('MTZ', 'Matriz') }) },
    'Campos obrigatórios': {
      descricao: 'O usuário passou pelos campos sem preencher: aparecem as mensagens de obrigatório.',
      inputs: () => {
        const form = formulario();
        form.markAllAsTouched();
        return { group: form };
      },
    },
    'Código já existe': {
      descricao: 'O serviço recusou o código ao salvar: a mensagem aparece abaixo do Código.',
      inputs: () => ({ group: formulario('MTZ', 'Matriz') }),
      // O erro vem da resposta do serviço, depois que o formulário já está na tela.
      acao: (campos) => {
        campos.group.controls.codigo.setErrors({ duplicado: true });
        campos.group.controls.codigo.markAsTouched();
      },
    },
    'Texto no limite': {
      descricao: `Os dois campos com o máximo de ${BRANCH_FIELD_MAX_LENGTH} caracteres.`,
      inputs: () => ({ group: formulario('C'.repeat(BRANCH_FIELD_MAX_LENGTH), 'D'.repeat(BRANCH_FIELD_MAX_LENGTH)) }),
    },
    'Carregando': {
      descricao: 'Enquanto a filial carrega, cada campo vira um bloco de skeleton.',
      inputs: () => ({ group: formulario(), loading: true }),
    },
  },
});
