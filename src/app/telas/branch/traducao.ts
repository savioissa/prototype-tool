import { Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';

/**
 * Opções de dropdown com o `label` já traduzido, atualizadas a cada troca de idioma.
 * `tag` diz de onde vem a tag de cada opção (por padrão, o próprio `label`).
 * Chamar no construtor ou na inicialização de campo do componente.
 */
export function opcoesTraduzidas<T extends { label: string }>(
  opcoes: readonly T[],
  tag: (opcao: T) => string = (opcao) => opcao.label,
): Signal<T[]> {
  const tags = opcoes.map(tag);
  return toSignal(
    inject(TranslateService)
      .stream(tags)
      .pipe(map((textos: Record<string, string>) => opcoes.map((opcao) => ({ ...opcao, label: textos[tag(opcao)] })))),
    { initialValue: [...opcoes] },
  );
}
