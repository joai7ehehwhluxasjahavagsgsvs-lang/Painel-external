Usando a imagem exportada (`painel-external-painel.tar`) no servidor

Se você não quer ou não pode construir a imagem no servidor, transfira o arquivo `painel-external-painel.tar` para o seu VPS e carregue a imagem:

1) No seu computador local (onde o tar foi gerado):

```bash
# enviando para o servidor (exemplo com scp)
scp painel-external-painel.tar user@yourserver:/tmp/
```

2) No servidor:

```bash
# carregar a imagem
docker load -i /tmp/painel-external-painel.tar
# criar diretório e arquivo docker-compose simples
cat > /opt/painel/docker-compose.yml <<'YAML'
version: '3.8'
services:
  painel:
    image: painel-external-painel:latest
    ports:
      - "3000:3000"
    restart: always
YAML

cd /opt/painel
docker compose up -d
```

3) Configure Nginx / domínio conforme `deploy/nginx_painel.conf` e obtenha SSL com Certbot.

Observação: a imagem já contém o frontend servido pelo backend, então apontar Nginx para `http://127.0.0.1:3000` é suficiente.
