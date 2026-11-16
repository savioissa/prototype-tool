import { Node, ts } from 'ts-morph';

/** Marca de expressão que não é feita só de literais. */
export const NAO_LITERAL = Symbol('não literal');

export function textoFixo(no: Node): string | undefined {
  if (Node.isStringLiteral(no) || Node.isNoSubstitutionTemplateLiteral(no)) {
    return no.getLiteralText();
  }
  return undefined;
}

/** Valor de uma expressão feita só de literais; NAO_LITERAL para qualquer outra coisa. */
export function valorLiteral(no: Node): unknown {
  if (Node.isAsExpression(no) || Node.isParenthesizedExpression(no) || Node.isSatisfiesExpression(no)) {
    return valorLiteral(no.getExpression());
  }
  const texto = textoFixo(no);
  if (texto !== undefined) {
    return texto;
  }
  if (Node.isNumericLiteral(no)) {
    return no.getLiteralValue();
  }
  if (Node.isPrefixUnaryExpression(no) && no.getOperatorToken() === ts.SyntaxKind.MinusToken) {
    const valor = valorLiteral(no.getOperand());
    return typeof valor === 'number' ? -valor : NAO_LITERAL;
  }
  if (Node.isTrueLiteral(no)) {
    return true;
  }
  if (Node.isFalseLiteral(no)) {
    return false;
  }
  if (Node.isNullLiteral(no)) {
    return null;
  }
  if (Node.isArrayLiteralExpression(no)) {
    const itens = no.getElements().map(valorLiteral);
    return itens.includes(NAO_LITERAL) ? NAO_LITERAL : itens;
  }
  if (Node.isObjectLiteralExpression(no)) {
    const objeto: Record<string, unknown> = {};
    for (const propriedade of no.getProperties()) {
      if (!Node.isPropertyAssignment(propriedade)) {
        return NAO_LITERAL;
      }
      const nome = propriedade.getNameNode();
      const chave = Node.isIdentifier(nome) ? nome.getText() : textoFixo(nome);
      const valor = valorLiteral(propriedade.getInitializerOrThrow());
      if (chave === undefined || valor === NAO_LITERAL) {
        return NAO_LITERAL;
      }
      objeto[chave] = valor;
    }
    return objeto;
  }
  return NAO_LITERAL;
}
