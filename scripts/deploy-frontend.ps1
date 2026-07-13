$ErrorActionPreference = 'Stop'
$server = 'root@157.22.203.160'
$appDir = '/var/www/myapp'
$pm2App = 'REPLACE-ME' # имя процесса фронтенда из pm2 list

npm run build
if ($LASTEXITCODE -ne 0) { Write-Host 'Build failed, deploy cancelled'; exit 1 }

tar -czf next.tar.gz --exclude='.next/cache' --exclude='.next/dev' .next
if ($LASTEXITCODE -ne 0) { exit 1 }

scp next.tar.gz "${server}:$appDir/"
if ($LASTEXITCODE -ne 0) { Remove-Item next.tar.gz; exit 1 }

ssh $server "cd $appDir && rm -rf .next && tar -xzf next.tar.gz && rm next.tar.gz && pm2 restart $pm2App"
Remove-Item next.tar.gz

Write-Host 'Frontend deployed'
