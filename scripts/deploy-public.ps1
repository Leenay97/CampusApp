$ErrorActionPreference = 'Stop'
$server = 'root@157.22.203.160'
$appDir = '/var/www/myapp'

tar -czf public.tar.gz public
if ($LASTEXITCODE -ne 0) { exit 1 }

scp public.tar.gz "${server}:$appDir/"
if ($LASTEXITCODE -ne 0) { Remove-Item public.tar.gz; exit 1 }

ssh $server "cd $appDir && rm -rf public && tar -xzf public.tar.gz && rm public.tar.gz && pm2 restart all"
Remove-Item public.tar.gz

Write-Host 'Public deployed'
