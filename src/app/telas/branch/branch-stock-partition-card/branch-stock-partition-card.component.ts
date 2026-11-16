import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateModule } from '@ngx-translate/core';

import { Warehouse } from '../branch.model';

/**
 * Card de um almoxarifado. Com `loading` o card inteiro vira um bloco de skeleton.
 * Com `selectable` ganha um checkbox à esquerda (usado na seleção para vincular).
 * Com `unlinkable` ganha o ícone de desvincular (lista da aba Almoxarifado).
 * Com `pickable` ganha o botão "Selecionar", antes de "Abrir" (escolha de um almoxarifado ao adicionar repositório).
 */
@Component({
  selector: 'app-branch-stock-partition-card',
  standalone: true,
  imports: [FormsModule, ButtonModule, CheckboxModule, TranslateModule],
  templateUrl: './branch-stock-partition-card.component.html',
  styleUrl: './branch-stock-partition-card.component.scss'
})
export class BranchStockPartitionCardComponent {
  @Input() stockPartition: Warehouse | null = null;
  @Input() loading = false;
  @Input() selectable = false;
  @Input() selected = false;
  @Input() unlinkable = false;
  /** Desvincular e abrir desabilitados (a aba está com a seção de vincular/adicionar aberta). */
  @Input() actionsDisabled = false;
  @Input() pickable = false;

  @Output() open = new EventEmitter<Warehouse>();
  @Output() selectedChange = new EventEmitter<boolean>();
  @Output() unlink = new EventEmitter<Warehouse>();
  @Output() pick = new EventEmitter<Warehouse>();
}
