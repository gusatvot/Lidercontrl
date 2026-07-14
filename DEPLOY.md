# LiderControl - Guía de Deploy en Vercel + Supabase (FREE)

Tiempo estimado: **20-30 minutos** · Costo: **$0/mes**

## Resumen

| Servicio | Rol | Plan |
|---------|-----|------|
| GitHub | Repositorio | Free |
| Vercel | Hosting Next.js | Free (Hobby) |
| Supabase | PostgreSQL 500MB | Free |
| Resend | Emails verificación | Free (3000/mes) |

---

## Paso 1: Subir código a GitHub

```bash
cd /ruta/al/proyecto
git init
git add .
git commit -m "LiderControl - listo para deploy"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/lidercontrol.git
git push -u origin main
```

---

## Paso 2: Crear DB en Supabase

1. https://supabase.com → Start your project
2. Crear proyecto: `lidercontrol`, generar password fuerte, región cercana
3. Project Settings → Database → Connection string
4. Copiar **dos URLs**:

**Transaction mode (puerto 6543)** → `DATABASE_URL`:
```
postgresql://postgres.XXXX:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
```

**Session mode (puerto 5432)** → `DIRECT_URL`:
```
postgresql://postgres.XXXX:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres
```

---

## Paso 3: Crear Resend (emails)

1. https://resend.com → Sign up
2. API Keys → Create API Key → copiar (empieza con `re_`)
3. (Opcional) Verificar tu dominio en Domains para no ir a spam
   - Sin verificar: usar `onboarding@resend.dev` (solo testing)

---

## Paso 4: Deploy en Vercel

1. https://vercel.com → Sign up with GitHub
2. Add New → Project → importar `lidercontrol`
3. Settings:
   - Build Command: `prisma generate && next build`
   - Install Command: `bun install`
4. Environment Variables:

```
DATABASE_URL = postgresql://postgres.XXXX:PASSWORD@...pooler.supabase.com:6543/postgres
DIRECT_URL = postgresql://postgres.XXXX:PASSWORD@...pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET = [generar con: openssl rand -base64 32]
NEXTAUTH_URL = https://TU-PROYECTO.vercel.app
RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM = LiderControl <onboarding@resend.dev>
```

5. Deploy → esperar ~3 min → URL: `https://lidercontrol-xxxx.vercel.app`

---

## Paso 5: Migrar schema y seed

Desde tu compu:

```bash
git clone https://github.com/TU_USUARIO/lidercontrol.git
cd lidercontrol
bun install

# Activar schema Postgres
cp prisma/schema.postgres.prisma prisma/schema.prisma

# Crear .env con las mismas vars que Vercel
cp .env.example .env
# Editar .env con DATABASE_URL y DIRECT_URL de Supabase

# Crear tablas
bunx prisma db push

# Cargar usuario demo
bun run scripts/seed.ts
```

---

## Paso 6: Verificar

1. Abrir `https://TU-PROYECTO.vercel.app`
2. Login: `demo` / `demo123`
3. Dashboard carga con datos de enero 2026 ✓

---

## Reactivar el chat (futuro)

El chat está desactivado porque Vercel free no soporta WebSocket persistente. Opciones:

### Opción A: Railway (~$15/mes)
Mover toda la app a Railway, levantar `mini-services/chat-service` en paralelo.
Descomentar proxy en `next.config.ts` y items de chat en `sidebar.tsx`, `mobile-nav.tsx`, `command-palette.tsx`, `use-keyboard-shortcuts.ts`, y `useSocket()` en `src/app/page.tsx`.

### Opción B: Pusher/Ably (free tier)
Reemplazar `src/lib/socket.ts` con cliente Pusher (200k msg/mes free).

---

## Troubleshooting

| Problema | Solución |
|---------|---------|
| Database connection error | Verificar puertos (6543 pooler, 5432 direct). Si Supabase pausó DB (7 días sin uso), reactivar desde panel. |
| NEXTAUTH_SECRET error | Es obligatorio en prod. `openssl rand -base64 32` |
| Email no llega | Verificar RESEND_API_KEY. Sin dominio verificado, usar `onboarding@resend.dev` |
| Build fails | Ver logs en Vercel → Deployments. Comúnmente falta `prisma generate` en build. |
| Dashboard vacío | Verificar que el seed corrió (Paso 5). Login con `demo`/`demo123`. |
