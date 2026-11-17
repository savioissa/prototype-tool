# Relatório de reconhecimento (cenário B)

Use este formato. Comece pelo JSON do `detectar-projeto.mjs` e complete lendo o código.
Seja curto: a pessoa precisa decidir as divergências, não ler um inventário.

```markdown
## Reconhecimento: <nome do projeto>

### O que encontrei
| Item | No projeto | Padrão IClass |
|---|---|---|
| Angular | 17.x.x (standalone, `@if`) | 17.3.12 (standalone, `@if`) |
| PrimeNG | ... | 17.18.15, lara-light-blue |
| Tradução | ... | ngx-translate 15, pt/en/es, ParserPosicional |
| Telas | `src/app/...` | `src/app/telas/` |
| Mocks | `*.mock.ts` exportando listas? | idem |
| Rotas | onde e como | `rotasDasTelas` + `comPrototipador` |
| Scripts | start: `...` · build: `...` | start com o observador do gerador |
| Node | `.nvmrc`/`engines` | 22.12+ (20.9+ aceito) |

### Divergências
1. **<o que diverge>.** <por que importa para o prototipador>.
   Proposta: <o que fazer>. Mexe em: <arquivos>.
2. ...

### Sem divergência
<itens que já estão no padrão, numa linha>
```

## Divergências comuns e propostas

| Divergência | Proposta |
|---|---|
| Telas fora de `src/app/telas/` | Apontar `pastaTelas` para a pasta real no `prototipador.config.json`. Não mover arquivos |
| Mocks com outro sufixo ou em JSON | Ajustar `mocks` no config se forem `.ts`; se forem JSON, a aba Dados fica vazia (limitação aceita) |
| Sem `ParserPosicional` | Adicionar `src/app/traducao/parser-posicional.ts` e registrar no `TranslateModule` (exige autorização: é fora dos pontos de contato) |
| Idiomas diferentes de pt/en/es | Sem proposta automática: o seletor de idiomas do prototipador é fixo em PT/EN/ES. Descrever e deixar a pessoa decidir |
| Sem ngx-translate | Sem proposta automática: a aba Traduções e o "Exibir tags" dependem dele |
| NgModule em vez de standalone | Sem proposta automática: o prototipador foi testado só em standalone |
| PrimeNG 17 em outra versão menor | Seguir; anotar no relatório final |
| `start` com opções (porta, proxy) | Preservar as opções dentro do `concurrently` |
| Rotas sem constante separada | Extrair as rotas para `rotasDasTelas` no próprio `app.routes.ts`, sem mudar nenhuma rota |
