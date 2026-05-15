# 🏆 Mundial 2026 — Bolão

Bolão multi-utilizador para o Mundial de Futebol 2026. Prevê resultados, competes em ligas privadas, acumula pontos.

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **Prisma 7** + **PostgreSQL (Neon)**
- **NextAuth v5** — Google, GitHub, email/password
- **API-Football** (api-sports.io) — dados dos jogos em tempo real

---

## Variáveis de Ambiente

Copia `.env` e preenche:

```env
# Base de dados Neon
DATABASE_URL="postgresql://user:password@host/mundial2026?sslmode=require"

# NextAuth (gera com: openssl rand -base64 32)
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://teu-dominio.vercel.app"

# OAuth — Google (console.cloud.google.com)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OAuth — GitHub (github.com/settings/apps)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# API Football (api-sports.io)
API_FOOTBALL_KEY="..."

# Cron secret (qualquer string aleatória)
CRON_SECRET="..."
```

---

## Configuração local

```bash
# 1. Instalar dependências
npm install

# 2. Criar a base de dados (precisa de DATABASE_URL no .env)
npm run db:push

# 3. Popular com jogos reais da API + admin inicial
npm run db:seed

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

**Admin padrão criado pelo seed:** `admin@mundial2026.com` / `admin123`

---

## Deploy (Vercel)

1. Conecta o repositório ao Vercel
2. Adiciona todas as variáveis de ambiente no dashboard
3. O `vercel.json` já configura o cron job para sincronizar a cada hora

> O cron job autentica via `Authorization: Bearer <CRON_SECRET>`.

---

## Sistema de Pontuação

| Acerto | Pontos base |
|--------|-------------|
| Vencedor / empate | 1 |
| Diferença de golos correta | 2 |
| Resultado exato | 5 |
| Marcador correto (por equipa) | +2 |
| Grupo completo (3/3 acertos) | +5 |
| Campeão (previsto antes do torneio) | +20 |

**Multiplicadores por fase:**

| Fase | Multiplicador |
|------|--------------|
| Grupos | ×1 |
| Oitavos | ×1.5 |
| Quartos | ×2 |
| Meias-Finais | ×3 |
| Final | ×4 |

---

## Páginas

| URL | Descrição |
|-----|-----------|
| `/` | Início — próximos jogos + top 10 |
| `/jogos` | Todos os jogos por fase/grupo |
| `/jogos/[id]` | Detalhe + formulário de previsão |
| `/leaderboard` | Classificação geral |
| `/ligas` | As minhas ligas |
| `/ligas/[id]` | Leaderboard da liga |
| `/ligas/entrar/[codigo]` | Entrada via link de convite |
| `/perfil` | Histórico + previsão do campeão |
| `/admin` | Gestão (só ADMIN) |

---

## Cron Job (sync manual)

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://teu-dominio.vercel.app/api/cron/sync
```
