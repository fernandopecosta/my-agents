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

## Deploy

- **[Coolify](COOLIFY.md)** — recomendado (Docker + volume persistente)
- Repositório: https://github.com/fernandopecosta/my-agents

### Resumo Coolify

1. New Application → repo `my-agents` → branch `main`
2. Build Pack: **Dockerfile** · Porta: **3000**
3. Variáveis: `AUTH_PASSWORD`, `AUTH_EDIT_PASSWORD`, `AUTH_SECRET`, `PERSISTENT_DATA_PATH=/data`
4. Persistent Storage montado em **`/data`**
5. Deploy + configurar domínio
