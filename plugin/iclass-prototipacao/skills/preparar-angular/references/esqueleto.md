# Esqueleto do projeto

Conteúdo de `pacotes/esqueleto.json`. A fonte fica no prototype-tool, em `plugin/esqueleto/`;
o parser posicional, o favicon e a pasta `.vscode/` vêm do próprio prototype-tool.

Marcados com ✱: arquivos que a skill `instalar-prototipador` altera depois.

| Arquivo | Por que existe |
|---|---|
| `package.json` ✱ | Versões exatas (sem `^`), `engines` aceitando Node 20.9+ e 22.12+. O nome é trocado na cópia |
| `package-lock.json` | Garante que `npm ci` instale exatamente a árvore testada |
| `.nvmrc` | `22`, a versão recomendada |
| `angular.json` | Tema `lara-light-blue`, `primeng.min.css` e `primeicons.css` nos estilos; orçamentos de tamanho folgados (o CSS do prototipador passa de 4 kB por componente) |
| `tsconfig*.json` | Iguais aos do prototype-tool; o `tsconfig.app.json` só parte de `main.ts`, então o gerador não entra no build |
| `.gitignore` ✱ | Padrão do Angular; o instalar acrescenta `gerado/` |
| `.editorconfig`, `.vscode/` | Iguais aos do prototype-tool (`.vscode/` é lido da raiz dele) |
| `README.md` | Como rodar e onde fica cada coisa |
| `src/index.html` | `lang="pt-BR"`; título trocado na cópia |
| `src/main.ts` | `bootstrapApplication` (standalone) |
| `src/styles.css` | Fundo e fonte vindos das variáveis do tema |
| `src/favicon.ico` | — |
| `src/app/app.component.*` | `RouterOutlet`, um `<p-toast>` global, ripple ligado |
| `src/app/app.config.ts` ✱ | Router, HttpClient, animações, `MessageService`, ngx-translate (padrão `pt`) com `ParserPosicional`. O carregador é a função `criarCarregadorDeTraducoes`, referenciada direto em `useFactory` para o instalar poder envolvê-la |
| `src/app/app.routes.ts` ✱ | `rotasDasTelas` vazio e `routes = rotasDasTelas`; o instalar troca a última linha por `comPrototipador(rotasDasTelas)` |
| `src/app/traducao/parser-posicional.ts` | Aceita `{0}`, `{1}` das tags da planilha, além de `{{ nome }}` |
| `src/app/telas/.gitkeep` | Pasta das telas, vazia |
| `src/assets/i18n/{pt,en,es}.json` | `{}`: os textos entram junto com as telas |

## Atualizar o esqueleto

1. Altere os arquivos em `plugin/esqueleto/` no prototype-tool.
2. Mudou alguma dependência? Rode `npm install --package-lock-only` dentro de
   `plugin/esqueleto/` para regenerar o lock.
3. Na raiz do prototype-tool, rode `npm run plugin:empacotar` e faça o commit.
