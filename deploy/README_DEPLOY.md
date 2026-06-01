Guia rápido de deploy para ter um site permanente (sem pedir comandos aos clientes)

Resumo: este repositório já inclui um `Dockerfile` e `docker-compose.yml` para rodar o backend (que serve o frontend). As opções abaixo mostram caminhos para transformar isso em um site público com domínio e HTTPS.

Opções recomendadas

- Hospedar em um VPS (DigitalOcean, Linode, Hetzner): você constrói a imagem e roda com Docker Compose. Use Nginx como reverse proxy e Certbot para obter SSL. Cliente só acessa a URL.
- Usar um PaaS com suporte a Docker (Render, Railway, Fly.io): faça push do repo e crie um serviço que use o `Dockerfile` ou a build automática. Eles provêm domínio e SSL.

Exemplo: deploy rápido em um VPS (DigitalOcean)

1) Crie um droplet (Ubuntu 22.04) e conecte por SSH.

2) Instale Docker + Docker Compose:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
```

3) No servidor, clone este repositório e inicie com Docker Compose:

```bash
git clone <repo-url> painel
cd painel
docker-compose up -d --build
```

4) Instale Nginx e configure reverse proxy (substitua `yourdomain.com`):

```bash
sudo apt install -y nginx
sudo tee /etc/nginx/sites-available/painel <<'EOF'
server {
  listen 80;
  server_name yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }
}
EOF

sudo ln -s /etc/nginx/sites-available/painel /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

5) Obtenha SSL com Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

6) Pronto — seu site público estará em `https://yourdomain.com` e os clientes não precisam executar nenhum comando.

Deploy em Render / Fly / Railway

- Crie conta e conecte o repositório GitHub.
- Crie um novo serviço, escolha Docker e a branch `main` (ou subdir se necessário).
- Configure variáveis de ambiente (se precisar). A plataforma cuidará do domínio e SSL.

Notas de segurança e recomendações

- Proteja acesso: implemente autenticação forte (o servidor tem um `authMiddleware` simples; substitua por algo robusto antes de vender).
- Atualize `painel-dual-ff-secret` para um segredo real em variáveis de ambiente no servidor.
- Use `pm2` ou Docker para manter o processo rodando e configure backups.
