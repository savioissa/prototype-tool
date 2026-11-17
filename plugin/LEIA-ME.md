# Plugin iclass-prototipacao

Plugin do Claude Code que monta um projeto de protótipo IClass numa pasta vazia (ou encaixa
o prototipador num projeto Angular 17 existente). Este repositório é a fonte da verdade: o
plugin carrega cópias empacotadas do código daqui.

```
plugin/
├─ .claude-plugin/marketplace.json   marketplace "iclass" (para instalar no Claude Code)
├─ empacotar.mjs                     gera os pacotes a partir deste repositório
├─ esqueleto/                        fonte do projeto Angular base
└─ iclass-prototipacao/
   ├─ .claude-plugin/plugin.json     nome e versão do plugin
   ├─ lib/pacote.mjs                 extração dos pacotes (usada pelos scripts)
   └─ skills/
      ├─ novo-prototipo/             coordena tudo; é a que a pessoa chama
      ├─ preparar-angular/           ambiente, detecção, esqueleto (pacotes/esqueleto.json)
      └─ instalar-prototipador/      prototipador (pacotes/prototipador.json), validação
```

## Instalar no Claude Code

No Claude Code, dentro de qualquer projeto:

```
/plugin marketplace add "C:\Users\Usuario\Desktop\Trabalho\Protótipos\prototype-tool\plugin"
/plugin install iclass-prototipacao@iclass
```

Depois, numa pasta vazia aberta na IDE: `/iclass-prototipacao:novo-prototipo`, ou só peça
"cria um projeto de protótipo".

## Atualizar o plugin depois de mudar o prototipador

1. Altere o código em `src/app/prototipador/` (ou `docs/prototipador/`, ou `plugin/esqueleto/`).
2. Rode `npm run proto:testar` e confira as abas com `npm start`.
3. Suba a versão em `iclass-prototipacao/.claude-plugin/plugin.json` e em
   `.claude-plugin/marketplace.json`.
4. Rode `npm run plugin:empacotar` e faça o commit dos pacotes junto com o código.
5. No Claude Code: `/plugin marketplace update iclass`.

O que não entra no pacote do prototipador: `gerado/` (saída do gerador), o CSV da planilha e
o `06-plano-de-construcao.md`. Telas (`src/app/telas/`) também não: o projeto novo nasce sem
telas.
