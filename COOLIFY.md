# Deploy no Coolify

Repositório: **https://github.com/fernandopecosta/my-agents**

## 1. Criar aplicação

1. Abra o painel do Coolify
2. **+ New Resource** → **Application**
3. Escolha o servidor e conecte o GitHub (se ainda não estiver)
4. Selecione o repositório `fernandopecosta/my-agents`
5. Branch: `main`

## 2. Build

| Campo | Valor |
|-------|-------|
| **Build Pack** | `Dockerfile` |
| **Dockerfile location** | `/Dockerfile` |
| **Port** | `3000` |

O Coolify detecta o Dockerfile na raiz. Não use Nixpacks — o Dockerfile já está otimizado para Next.js standalone.

## 3. Variáveis de ambiente

Em **Environment Variables**, adicione:

```
AUTH_PASSWORD=sua-senha-de-acesso
AUTH_EDIT_PASSWORD=sua-senha-de-edicao
AUTH_SECRET=string-longa-e-aleatoria-min-32-chars
PERSISTENT_DATA_PATH=/data
```

> `PERSISTENT_DATA_PATH=/data` já vem no Dockerfile, mas defina também no Coolify para ficar explícito.

## 4. Storage persistente (obrigatório)

Sem volume, agentes, avatares e skills **somem a cada redeploy**.

1. Vá em **Persistent Storage** (ou **Storages**)
2. **Add Storage**
3. **Mount Path:** `/data`
4. Salve e redeploy

## 5. Domínio

1. **Settings** → **Domains**
2. Adicione um domínio (subdomínio do Coolify ou domínio próprio)
3. Ative HTTPS (Let's Encrypt automático no Coolify)

## 6. Deploy

Clique em **Deploy**. O build usa multi-stage Docker (~2–4 min na primeira vez).

## Testar localmente com Docker

```bash
cp .env.example .env
# Edite .env com suas senhas

docker compose up --build
```

Acesse http://localhost:3000

## Troubleshooting

| Problema | Solução |
|----------|---------|
| App sobe mas perde dados | Confirme volume em `/data` e `PERSISTENT_DATA_PATH=/data` |
| 502 / unhealthy | Porta deve ser `3000` |
| Login não funciona | Verifique `AUTH_SECRET` definido em produção |
| `EACCES` em `/data/agents.json` | Confirme redeploy com a versão mais recente (entrypoint corrige permissões do volume) |
| Build falha | Veja logs; confirme que usa **Dockerfile**, não Nixpacks |
