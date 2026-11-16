import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LinkedRepository, Repository, Warehouse, repositoryLinkKey } from '../branch.model';
import { BranchService } from '../branch.service';
import { BranchRepositoryPickerComponent } from '../branch-repository-picker/branch-repository-picker.component';
import { BranchStockPartitionPickerComponent } from '../branch-stock-partition-picker/branch-stock-partition-picker.component';

/**
 * Tela cinza "Adicionar repositório" da aba Repositório: o usuário escolhe um almoxarifado e um repositório e
 * salva o par na filial. As duas escolhas podem ficar abertas juntas; a de repositório começa fechada e abre
 * sozinha quando o almoxarifado é escolhido (se ainda não houver repositório). O card do
 * par só aparece na lista da aba, depois de salvar. Almoxarifado fora da filial é vinculado a ela também ao
 * salvar. Par que já existe não pode ser salvo.
 */
@Component({
  selector: 'app-branch-repository-add',
  standalone: true,
  imports: [ButtonModule, BranchRepositoryPickerComponent, BranchStockPartitionPickerComponent, TranslateModule],
  templateUrl: './branch-repository-add.component.html',
  styleUrl: './branch-repository-add.component.scss'
})
export class BranchRepositoryAddComponent {
  private readonly service = inject(BranchService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  @Input({ required: true }) branchCode!: string;
  /** Vínculos que a filial já tem: o par escolhido não pode repetir nenhum deles. */
  @Input() linked: LinkedRepository[] = [];

  /** Usuário cancelou sem salvar. */
  @Output() closed = new EventEmitter<void>();
  /** Par salvo: a lista de repositórios da filial precisa recarregar. */
  @Output() added = new EventEmitter<void>();

  @ViewChild(BranchRepositoryPickerComponent) private repositoryPicker?: BranchRepositoryPickerComponent;

  almoxarifado: Warehouse | null = null;
  repositorio: Repository | null = null;
  saving = false;

  /** O par escolhido já está vinculado à filial. */
  get duplicado(): boolean {
    if (!this.almoxarifado || !this.repositorio) return false;
    const chave = repositoryLinkKey(this.repositorio, this.almoxarifado.codigo);
    return this.linked.some((l) => repositoryLinkKey(l, l.almoxarifado.codigo) === chave);
  }

  /** Almoxarifado escolhido: abre a escolha de repositório, se ainda não houver um. */
  onAlmoxarifado(almoxarifado: Warehouse | null): void {
    this.almoxarifado = almoxarifado;
    if (almoxarifado && !this.repositorio) this.repositoryPicker?.abrirVinculacao();
  }

  get podeSalvar(): boolean {
    return !!this.almoxarifado && !!this.repositorio && !this.duplicado && !this.saving;
  }

  salvar(): void {
    if (!this.podeSalvar || !this.almoxarifado || !this.repositorio) return;
    this.saving = true;
    const { tipo, codigo } = this.repositorio;

    this.service.adicionarRepositorio(this.branchCode, { tipo, codigo, almoxarifado: this.almoxarifado.codigo }).subscribe({
      next: () => {
        this.saving = false;
        this.messages.add({ severity: 'success', summary: this.translate.instant('iclass.generic.label.repository-added-successfully'), life: 4000 });
        this.added.emit();
      },
      error: () => {
        this.saving = false;
        this.messages.add({
          severity: 'error',
          summary: this.translate.instant('iclass.generic.label.could-not-add-repository'),
          life: 6000
        });
      }
    });
  }
}
