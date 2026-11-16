// Códigos de idioma usados pelo projeto. Devem bater com `i18n.idiomas` do prototipador.config.json.
export const IDIOMAS = [
  { codigo: 'pt', rotulo: 'PT' },
  { codigo: 'en', rotulo: 'EN' },
  { codigo: 'es', rotulo: 'ES' },
] as const;

export type CodigoIdioma = (typeof IDIOMAS)[number]['codigo'];

/** Pseudo-idioma do modo "exibir tags": cada texto é a própria chave. */
export const IDIOMA_TAGS = 'proto-tags';

export function ehIdioma(valor: unknown): valor is CodigoIdioma {
  return IDIOMAS.some((idioma) => idioma.codigo === valor);
}
