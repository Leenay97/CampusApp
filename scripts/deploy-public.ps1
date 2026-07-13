$ErrorActionPreference = 'Stop'
$server = 'root@157.22.203.160'
$appDir = '/var/www/myapp'
$pm2App = 'REPLACE-ME' # имя процесса фронтенда из pm2 list

tar -czf public.tar.gz public
if ($LASTEXITCODE -ne 0) { exit 1 }

scp public.tar.gz "${server}:$appDir/"
if ($LASTEXITCODE -ne 0) { Remove-Item public.tar.gz; exit 1 }

ssh $server "cd $appDir && rm -rf public && tar -xzf public.tar.gz && rm public.tar.gz && pm2 restart $pm2App"
Remove-Item public.tar.gz

Write-Host 'Public deployed'
