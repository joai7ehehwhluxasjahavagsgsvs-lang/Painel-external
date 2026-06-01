# Painel-external

Este repositório contém o painel web do Cheat Panel e agora inclui um empacotamento Electron para gerar um aplicativo desktop funcional.

## O que foi adicionado

- `package.json`: scripts para iniciar o app Electron e gerar instaladores.
- `main.js`: inicializa o servidor backend local e carrega o frontend via Electron.
- `preload.js`: expõe apenas uma API mínima ao contexto da janela.
- `site/`: site estático para disponibilizar o download do aplicativo.
- `.gitignore`: ignora `node_modules/` e `dist/` no nível do projeto.
- `cheat-panel/backend/server.js`: adicionada a rota `/api/clean` para suportar a interface de limpeza.

## Como testar localmente

1. Instale as dependências no nível do repositório:

```bash
cd /workspaces/Painel-external
npm install
```

2. Inicie o aplicativo Electron:

```bash
npm start
```

3. O app abrirá o painel web e o backend local ficará disponível em `http://localhost:3000`.

## Como gerar instaladores

```bash
npm run dist
```

Os instaladores serão gerados em `dist/`.

## Site de download

Abra `site/index.html` em um navegador ou hospede essa pasta como um site estático. Ele mostra links para os instaladores gerados em `dist/`.
