$ErrorActionPreference = 'Stop'
$server = 'root@157.22.203.160'
$serverDir = '/var/www/myapp/server'
$pm2App = 'REPLACE-ME' # имя процесса бэкенда из pm2 list

tar -czf server.tar.gz -C server config graphql jobs models index.js ws.js createAdmin.js package.json package-lock.json
if ($LASTEXITCODE -ne 0) { exit 1 }

scp server.tar.gz "${server}:$serverDir/"
if ($LASTEXITCODE -ne 0) { Remove-Item server.tar.gz; exit 1 }

ssh $server "cd $serverDir && tar -xzf server.tar.gz && rm server.tar.gz && pm2 restart $pm2App"
Remove-Item server.tar.gz

Write-Host 'Backend deployed'
