import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

import { REPOSITORY_FIELDS, Repository, RepositoryFieldDef, Warehouse, repositoryTypeTag } from '../branch.model';

/**
 * Card de um repositório com os dois campos do tipo (REPOSITORY_FIELDS): Equipe Login | Técnico,
 * Armazém Código | Descrição, Oficina Descrição | Credenciada, Credenciada Código | Nome, Cluster Regional | Nome.
 * - Com `stockPartition`, vira o card do vínculo: Almoxarifado e Tipo vêm antes, na mesma linha (aba Repositório).
 *   Sem ele (escolha de repositório) o tipo não aparece, porque já está no select de tipo.
 * - Com `unlinkable` ganha o ícone de desvincular (lista da aba Repositório).
 * - Com `pickable` ganha o botão "Selecionar", antes de "Abrir" (escolha de um repositório ao adicionar).
 */
@Component({
  selector: 'app-branch-repository-card',
  standalone: true,
  imports: [ButtonModule, TranslateModule],
  templateUrl: './branch-repository-card.component.html',
  styleUrl: './branch-repository-card.component.scss'
})
export class BranchRepositoryCardComponent {
  @Input() repository: Repository | null = null;
  /** Almoxarifado do vínculo: quando há, aparece como primeira coluna. */
  @Input() stockPartition: Warehouse | null = null;
  @Input() loading = false;
  @Input() unlinkable = false;
  /** Desvincular e abrir desabilitados (a aba está com a seção de vincular/adicionar aberta). */
  @Input() actionsDisabled = false;
  @Input() pickable = false;

  @Output() open = new EventEmitter<Repository>();
  @Output() unlink = new EventEmitter<Repository>();
  @Output() pick = new EventEmitter<Repository>();

  get campos(): RepositoryFieldDef[] {
    return REPOSITORY_FIELDS[this.repository?.tipo ?? 'armazem'];
  }

  get tipoLabel(): string {
    return this.repository ? repositoryTypeTag(this.repository.tipo) : '';
  }

  get almoxarifadoLabel(): string {
    return this.stockPartition ? `${this.stockPartition.codigo} - ${this.stockPartition.descricao}` : '';
  }
}
