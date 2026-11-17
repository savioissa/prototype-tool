import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BranchFieldsComponent, createBranchForm } from '../branch-fields/branch-fields.component';
import { Branch } from '../branch.model';
import { BranchService, DuplicateBranchError } from '../branch.service';

/**
 * Aba Cadastro da home da filial: campos em modo leitura; "Editar" habilita, "Cancelar" desfaz e
 * "Salvar" grava. Avisa o contêiner com a filial gravada (ele atualiza a lateral e a URL).
 * Cancelar com alterações pede confirmação; sair da aba ou da página em edição também (ver `confirmarSaida`).
 */
@Component({
  selector: 'app-branch-register',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, ConfirmDialogModule, BranchFieldsComponent, TranslateModule],
  // confirmações só desta aba (o <p-confirmDialog> fica no template)
  providers: [ConfirmationService],
  templateUrl: './branch-register.component.html',
  styleUrl: './branch-register.component.scss'
})
export class BranchRegisterComponent implements OnChanges {
  private readonly service = inject(BranchService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly confirmation = inject(ConfirmationService);

  /** Filial aberta; `null` enquanto carrega. */
  @Input() branch: Branch | null = null;
  @Input() loading = false;

  /** Gravação concluída: leva a filial com os valores novos. */
  @Output() saved = new EventEmitter<Branch>();

  readonly form = createBranchForm(inject(NonNullableFormBuilder));

  editing = false;
  saving = false;

  constructor() {
    this.form.disable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // filial nova (carga ou gravação): campos voltam aos valores gravados, em leitura
    if (changes['branch'] && this.branch) {
      this.resetForm(this.branch);
      this.editing = false;
    }
  }

  editar(): void {
    this.editing = true;
    this.form.enable();
  }

  /** Com alterações, pede confirmação antes de descartar; sem alterações, sai da edição direto. */
  cancelar(): void {
    if (!this.form.dirty) {
      this.descartar();
      return;
    }

    this.confirmation.confirm({
      message: this.translate.instant('portal.generic.label.confirm-cancel'),
      acceptLabel: this.translate.instant('iclass.generic.label.discard-changes'),
      rejectLabel: this.translate.instant('portal.generic.label.keep-editing'),
      acceptButtonStyleClass: 'btn--md btn--danger',
      rejectButtonStyleClass: 'btn--md btn--neutral',
      acceptIcon: 'none',
      rejectIcon: 'none',
      defaultFocus: 'reject',
      accept: () => this.descartar()
    });
  }

  /**
   * Chamado pelo contêiner antes de trocar de aba ou sair da página. Fora da edição, libera na hora.
   * Em edição, pergunta (mesmo diálogo da criação): "Sair" descarta a edição e libera; "Continuar editando" segura.
   */
  confirmarSaida(): Promise<boolean> {
    if (!this.editing) return Promise.resolve(true);

    return new Promise((resolve) =>
      this.confirmation.confirm({
        message: this.translate.instant('portal.generic.label.branch-leave-description'),
        acceptLabel: this.translate.instant('iclass.generic.label.leave'),
        rejectLabel: this.translate.instant('portal.generic.label.keep-editing'),
        acceptButtonStyleClass: 'btn--md btn--danger',
        rejectButtonStyleClass: 'btn--md btn--neutral',
        acceptIcon: 'none',
        rejectIcon: 'none',
        defaultFocus: 'reject',
        accept: () => {
          this.descartar();
          resolve(true);
        },
        // "Continuar editando" ou Esc
        reject: () => resolve(false)
      })
    );
  }

  salvar(): void {
    if (!this.branch || this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const { codigo, descricao } = this.form.getRawValue();
    this.saving = true;

    this.service.atualizar(this.branch.codigo, { codigo: codigo.trim(), descricao: descricao.trim() }).subscribe({
      next: (atualizada) => {
        this.saving = false;
        this.editing = false;
        this.resetForm(atualizada);
        this.saved.emit(atualizada);
      },
      error: (err: unknown) => {
        this.saving = false;
        if (err instanceof DuplicateBranchError) {
          this.form.controls.codigo.setErrors({ duplicado: true });
          this.form.controls.codigo.markAsTouched();
        } else {
          // mesmo padrão da criação: falha ao salvar vira toast
          this.messages.add({
            severity: 'error',
            summary: this.translate.instant('iclass.generic.label.could-not-save-branch'),
            life: 6000
          });
        }
      }
    });
  }

  /** Volta os campos aos valores gravados e sai da edição. */
  private descartar(): void {
    if (this.branch) this.resetForm(this.branch);
    this.editing = false;
  }

  /** Volta os campos para os valores gravados, em modo leitura. */
  private resetForm(branch: Branch): void {
    this.form.reset({ codigo: branch.codigo, descricao: branch.descricao });
    this.form.disable();
  }
}
