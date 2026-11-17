---
name: novo-prototipo
description: Cria ou prepara um projeto de protótipo da IClass com Angular 17 + PrimeNG + ngx-translate e instala o prototipador (moldura com as abas Principal, Área de teste, Dados e Traduções). Use sempre que alguém quiser começar um protótipo, montar um projeto novo para prototipar telas, "subir o prototipador", instalar a ferramenta de prototipação num projeto Angular existente ou preparar uma pasta vazia para o time de design, mesmo que a pessoa não diga "prototipador" nem "skill".
---

# Novo protótipo

Esta skill coordena a montagem de um projeto de protótipo. Ela não escreve código sozinha:
chama outras skills do plugin, cada uma responsável por uma parte, e conversa com a pessoa
nos dois checkpoints.

| Etapa | Quem faz | Resultado |
|---|---|---|
| 1. Ambiente e cenário | esta skill (scripts) | Sabe se dá para seguir e qual caminho tomar |
| 2. Angular | skill `iclass-prototipacao:preparar-angular` | Projeto Angular 17 + PrimeNG + i18n funcionando |
| **Checkpoint 1** | esta skill | A pessoa confirma o plano |
| 3. Prototipador | skill `iclass-prototipacao:instalar-prototipador` | Moldura, gerador e abas instalados |
| 4. Validação | dentro da `instalar-prototipador` | Build, testes do gerador e regras de isolamento conferidos |
| **Checkpoint final** | esta skill | Relatório e roteiro de conferência |

A fase 2 (agentes e documentação de interface) é outra skill e não roda aqui.

## Com quem você está falando

Quem roda esta skill pode ser designer ou dev. Fale em linguagem simples por padrão: diga o
que está acontecendo e por quê, sem jargão. Dê detalhes técnicos (versões, comandos, trechos
de erro) quando a pessoa pedir ou quando ela demonstrar que é dev. Nunca peça para a pessoa
editar código; se algo precisa mudar, você muda (com autorização, quando a regra exigir).

O ambiente costuma ser Windows, com caminhos que têm espaços e acentos
(`C:\Users\...\Protótipos\...`). Sempre passe caminhos entre aspas para os scripts.

## Etapa 1 — Ambiente e cenário

Os scripts ficam na skill vizinha `preparar-angular` (`<pasta desta skill>/../preparar-angular/scripts/`).
Rode os dois a partir da pasta do projeto (a pasta aberta na IDE), com o caminho absoluto
entre aspas:

```bash
node "<pasta desta skill>/../preparar-angular/scripts/verificar-ambiente.mjs"
node "<pasta desta skill>/../preparar-angular/scripts/detectar-projeto.mjs" "."
```

Os dois imprimem JSON. Use-os assim:

**Ambiente.** O projeto aceita Node 20 (a partir do 20.9) ou Node 22 (a partir do 22.12), e
recomenda o 22.

- Node fora dessas faixas (`ok: false`): pare e explique como instalar o 22 (nvm-windows no
  Windows: `nvm install 22` e `nvm use 22`).
- Node 20 (`avisos` preenchido): siga, mas diga à pessoa, em uma frase, que o recomendado é o
  22 e que o `npm` vai mostrar avisos "EBADENGINE" que podem ser ignorados. Não insista.
- Sem npm, pare. Sem git, siga, mas avise que o projeto não terá histórico.

**Cenário.** O campo `cenario` decide o caminho:

| `cenario` | O que significa | O que fazer |
|---|---|---|
| `vazio` | Pasta vazia (aceita `.git`, `.vscode`, `.claude`, `.idea`, `README.md`, `.gitignore`) | Cenário A: criar o projeto |
| `angular17` | Projeto Angular 17 | Cenário B: encaixar o prototipador |
| `angular-outra-versao` | Angular, mas não 17 | Pare. Explique que o prototipador só foi testado no Angular 17 e não tente adaptar |
| `prototipador-instalado` | Já existe `src/app/prototipador/` | Pare e pergunte se a pessoa quer reinstalar ou atualizar (a atualização ainda não existe; registre o pedido) |
| `outro` | Pasta com arquivos que não são um projeto Angular | Pare e peça uma pasta vazia |

## Dados que você precisa antes da etapa 2

Pergunte de uma vez só, com o AskUserQuestion, o que não tiver como descobrir:

- **Nome do projeto** (cenário A). Sugira o nome da pasta em kebab-case.
- **Planilha de tags.** Caminho do CSV exportado da planilha de tags. Sugira o caminho padrão
  `C:\Users\Usuario\Desktop\Trabalho\Planilha I18N - Página1.csv` e confira se o arquivo
  existe. Ele é copiado para o projeto e o caminho de origem fica guardado: a cada
  `npm start`, o projeto busca a versão mais nova de lá. Se não existir ou a pessoa não tiver
  a planilha agora, siga sem ela: a aba Traduções mostra "planilha indisponível" e o CSV pode
  ser colocado depois em `src/app/prototipador/entrada/tags.csv`.

## Etapa 2 — Angular

Invoque a skill `iclass-prototipacao:preparar-angular`, passando o cenário, o nome do projeto
e o resultado dos scripts. Ela devolve um resumo do que fez (cenário A) ou um relatório de
reconhecimento com divergências (cenário B).

## Checkpoint 1

Mostre à pessoa, em poucas linhas:

- Cenário A: projeto criado, versões instaladas, `npm start` do Angular puro funcionando.
- Cenário B: o relatório de reconhecimento e **cada divergência com uma proposta**.

Pergunte se pode seguir para o prototipador. No cenário B, a pessoa precisa decidir cada
divergência antes de você continuar; não preencha a decisão com um palpite.

## Etapa 3 — Prototipador

Invoque a skill `iclass-prototipacao:instalar-prototipador`, passando o cenário, as decisões
do checkpoint 1 e o caminho da planilha.

## Etapa 4 — Validação

A `instalar-prototipador` termina rodando o `validar.mjs` e devolve o resultado de cada
checagem. Não repita a validação; use esse resultado no relatório.

No cenário A, com git e todas as checagens passando, faça um segundo commit:
"Prototipador <versão> instalado pela skill instalar-prototipador". No cenário B, não faça
commit: o repositório é da pessoa, e ela decide quando e como registrar a mudança.

## Checkpoint final

Entregue um relatório curto neste formato:

```
## Protótipo pronto

**Projeto:** <nome> · Angular <versão> · PrimeNG <versão> · prototipador <versão do plugin>
**Planilha de tags:** <copiada de ... | não configurada>

### Checagens
- [x] Gerador roda e testes passam
- [x] Build do Angular
- [x] Telas não importam o prototipador

### Para conferir agora (5 minutos)
1. Rode `npm start` e abra http://localhost:4200
2. Veja o menu lateral com 4 abas; recolha e recarregue a página
3. Troque o idioma (PT/EN/ES) e ligue "Exibir tags"
4. Abra Área de teste, Dados e Traduções: sem telas, elas mostram o estado vazio

### Próximos passos
- Crie a primeira tela em `src/app/telas/`
- Fase 2 (agentes e documentação de interface): skill própria, ainda não disponível
```

Termine aí. Não comece a criar telas.
