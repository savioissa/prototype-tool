// Estado do prototipador guardado no localStorage, para sobreviver ao recarregamento.
// O acesso pode falhar (janela privada, armazenamento bloqueado): nesse caso vale o padrão.

export function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto === null ? padrao : (JSON.parse(bruto) as T);
  } catch {
    return padrao;
  }
}

export function gravar(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Sem armazenamento, o estado vale só até recarregar.
  }
}
