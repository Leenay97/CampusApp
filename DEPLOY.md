# Деплой на сервер (157.22.203.160)

Все команды выполняются локально из корня проекта в PowerShell.
На сервере приложение живёт в `/var/www/myapp` (фронт) и `/var/www/myapp/server` (бэк).

## Фронтенд (изменения в src/)

```powershell
npm run build
tar -czf next.tar.gz --exclude='.next/cache' --exclude='.next/dev' .next
scp next.tar.gz root@157.22.203.160:/var/www/myapp/
ssh root@157.22.203.160 "cd /var/www/myapp && rm -rf .next && tar -xzf next.tar.gz && rm next.tar.gz"
Remove-Item next.tar.gz
ssh root@157.22.203.160 "pm2 restart <имя-фронтенда>"
```

Сборка берёт прод-переменные из `.env.production` — если поменяли переменные, пересоберите.

## Статика public/ (sw.js, картинки)

Нужно только если менялось содержимое `public/`.

```powershell
tar -czf public.tar.gz public
scp public.tar.gz root@157.22.203.160:/var/www/myapp/
ssh root@157.22.203.160 "cd /var/www/myapp && rm -rf public && tar -xzf public.tar.gz && rm public.tar.gz"
Remove-Item public.tar.gz
ssh root@157.22.203.160 "pm2 restart <имя-фронтенда>"
```

## Бэкенд (изменения в server/)

```powershell
tar -czf server.tar.gz -C server config graphql jobs models index.js ws.js createAdmin.js package.json package-lock.json
scp server.tar.gz root@157.22.203.160:/var/www/myapp/server/
ssh root@157.22.203.160 "cd /var/www/myapp/server && tar -xzf server.tar.gz && rm server.tar.gz"
Remove-Item server.tar.gz
ssh root@157.22.203.160 "pm2 restart <имя-бэкенда>"
```

Если добавили новую зависимость в `server/package.json` — перед перезапуском:

```powershell
ssh root@157.22.203.160 "cd /var/www/myapp/server && npm ci --omit=dev"
```

Аналогично для фронтенда (`package.json` в корне):

```powershell
ssh root@157.22.203.160 "cd /var/www/myapp && npm ci --omit=dev"
```

## Что НЕЛЬЗЯ трогать на сервере

- `/var/www/myapp/server/uploads` — файлы пользователей, не удалять и не перезаписывать
- `/var/www/myapp/server/.env` и `/var/www/myapp/.env*` — серверные переменные
- `node_modules` — ставятся на сервере через `npm ci`, с локальной машины не заливать (там нативные модули под Linux)

## Примечания

- Мажорная версия Node локально и на сервере должна совпадать.
- Пароль спрашивается на каждое ssh/scp — можно настроить вход по ключу (`ssh-keygen`, затем скопировать ключ на сервер).
