#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  cat <<EOF
Usage: sudo $0 <DOMAIN> <GIT_REPO> <EMAIL> [BRANCH]

Example:
  sudo $0 yourdomain.com https://github.com/you/Painel-external.git you@example.com main
EOF
  exit 1
fi

DOMAIN=$1
GIT_REPO=$2
EMAIL=$3
BRANCH=${4:-main}

ROOT_DIR=/opt/painel

echo "Bootstrap iniciando para domínio=${DOMAIN}, repo=${GIT_REPO}, branch=${BRANCH}"

apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release git nginx

# Install Docker
if ! command -v docker >/dev/null 2>&1; then
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# Create app dir and clone
rm -rf "$ROOT_DIR"
git clone --depth 1 --branch "$BRANCH" "$GIT_REPO" "$ROOT_DIR"

cd "$ROOT_DIR"

# Build and run with docker compose
docker compose pull || true
docker compose up -d --build

# Configure Nginx
NGINX_CONF=/etc/nginx/sites-available/painel
cat > "$NGINX_CONF" <<EOF
server {
  listen 80;
  server_name ${DOMAIN};

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/painel
nginx -t
systemctl restart nginx

# Install certbot and obtain certificate
if ! command -v certbot >/dev/null 2>&1; then
  apt-get install -y certbot python3-certbot-nginx
fi

certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" || true

echo "Deploy concluído. Acesse: https://${DOMAIN} (pode levar alguns segundos para o nginx/ssl ativar)"
