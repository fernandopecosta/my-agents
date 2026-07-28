# My Agents

Sistema local para cadastrar e gerenciar agentes de IA. Cada agente possui nome, descrição, avatar, prompt de instruções e uma pasta de skills (arquivos `SKILL.md`).

## Requisitos

- Node.js 18+
- npm

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura de dados

- **Metadados**: `data/agents.json`
- **Arquivos por agente**: `storage/agents/{id}/`
  - `avatar.png` — imagem do avatar
  - `skills/{nome-da-skill}/SKILL.md` — skills uploadadas

## Funcionalidades

- Galeria de agentes com grid assimétrico
- Criar, editar e excluir agentes
- Upload de avatar (PNG, JPEG, WebP, GIF — máx. 2 MB)
- Upload de skills em `.md` (máx. 500 KB)
- Visualização de prompt e skills no detalhe do agente

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |

## Deploy no Railway

1. Faça push do repositório para o GitHub
2. Crie um projeto no [Railway](https://railway.com) e conecte o repo
3. Configure as variáveis de ambiente (veja `.env.example`)
4. Adicione um **Volume** montado em `/data` e defina `PERSISTENT_DATA_PATH=/data`
5. Gere um domínio público em **Settings → Networking**

Sem o volume persistente, uploads e cadastros serão perdidos a cada redeploy.
