import { Injectable } from '@angular/core';
import { TranslateDefaultParser } from '@ngx-translate/core';

/**
 * As tags da planilha usam parâmetros posicionais (`Vincular ({0})`, `"{0}" do almoxarifado "{1}"`),
 * além dos nomeados do ngx-translate (`{{ total }}`). Uso: `'tag' | translate: { '0': valor }`.
 */
@Injectable()
export class ParserPosicional extends TranslateDefaultParser {
  override interpolate(expressao: string | Function, parametros?: any): string {
    const texto = super.interpolate(expressao, parametros);
    if (typeof texto !== 'string' || !parametros) {
      return texto;
    }
    return texto.replace(/\{(\d+)\}/g, (marca, posicao) => (parametros[posicao] === undefined ? marca : String(parametros[posicao])));
  }
}
